// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EmeraldMarket is ReentrancyGuard {
  /////////////////////
  //    Structs      //
  /////////////////////

  struct Listing {
    uint256 price;
    address seller;
  }

  /////////////////////
  //     Events      //
  /////////////////////

  event ItemListed(
    address indexed seller,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );

  event ItemBought(
    address indexed buyer,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );

  event ItemCanceled(
    address indexed seller,
    address indexed nftAddress,
    uint256 indexed tokenId
  );

  /////////////////////
  //     States      //
  /////////////////////

  mapping(address => mapping(uint256 => Listing)) private listings;
  mapping(address => uint256) private proceeds;

  /////////////////////
  //    Modifiers    //
  /////////////////////

  modifier notListed(
    address nftAddress,
    uint256 tokenId,
    address owner
  ) {
    Listing memory listing = listings[nftAddress][tokenId];
    require(listing.price == 0, "NTF Emerald already listed");
    _;
  }

  modifier isOwner(
    address nftAddress,
    uint256 tokenId,
    address spender
  ) {
    IERC721 emerald = IERC721(nftAddress);
    address owner = emerald.ownerOf(tokenId);
    require(spender == owner, "Not owner");
    _;
  }

  modifier isListed(address nftAddress, uint256 tokenId) {
    Listing memory listing = listings[nftAddress][tokenId];
    require(listing.price > 0, "Not listed");
    _;
  }

  constructor() {}

  /////////////////////
  // Main Functions //
  /////////////////////

  /*
   * @notice Method for listing NFT
   * @param nftAddress Address of NFT contract
   * @param tokenId Token ID of NFT
   * @param price sale price for each item
   */
  function listItem(
    address nftAddress,
    uint256 tokenId,
    uint256 price
  )
    external
    notListed(nftAddress, tokenId, msg.sender)
    isOwner(nftAddress, tokenId, msg.sender)
  {
    require(price > 0, "Price must be above zero");

    IERC721 emerald = IERC721(nftAddress);

    require(
      emerald.getApproved(tokenId) == address(this),
      "Emerald NTF not approved for marketplace"
    );

    listings[nftAddress][tokenId] = Listing(price, msg.sender);
    emit ItemListed(msg.sender, nftAddress, tokenId, price);
  }

  /*
   * @notice Method for buying listing
   * @param nftAddress Address of NFT contract
   * @param tokenId Token ID of NFT
   */
  function buyItem(
    address nftAddress,
    uint256 tokenId
  ) external payable nonReentrant isListed(nftAddress, tokenId) {
    Listing memory listedItem = listings[nftAddress][tokenId];
    require(msg.value >= listedItem.price, "NTF Emerald price not met");

    proceeds[listedItem.seller] = proceeds[listedItem.seller] + msg.value;

    delete (listings[nftAddress][tokenId]);

    IERC721(nftAddress).safeTransferFrom(
      listedItem.seller,
      msg.sender,
      tokenId
    );

    emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
  }

  /*
   * @notice Method for updating listing
   * @param nftAddress Address of NFT contract
   * @param tokenId Token ID of NFT
   * @param newPrice Price in Wei of the item
   */
  function updateListing(
    address nftAddress,
    uint256 tokenId,
    uint256 newPrice
  )
    external
    isListed(nftAddress, tokenId)
    isOwner(nftAddress, tokenId, msg.sender)
  {
    listings[nftAddress][tokenId].price = newPrice;
    emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
  }

  /*
   * @notice Method for cancelling listing
   * @param nftAddress Address of NFT contract
   * @param tokenId Token ID of NFT
   */
  function cancelListing(
    address nftAddress,
    uint256 tokenId
  )
    external
    isOwner(nftAddress, tokenId, msg.sender)
    isListed(nftAddress, tokenId)
  {
    delete (listings[nftAddress][tokenId]);
    emit ItemCanceled(msg.sender, nftAddress, tokenId);
  }

  /*
   * @notice Method for withdrawing proceeds from sales
   */
  function withdrawProceeds() external {
    uint256 ownerProceeds = proceeds[msg.sender];
    require(ownerProceeds > 0, "No proceeds to withdraw");

    proceeds[msg.sender] = 0;

    (bool success, ) = payable(msg.sender).call{value: ownerProceeds}("");
    require(success, "Withdrawal of proceeds failed");
  }

  /////////////////////
  //     Getters     //
  /////////////////////

  function getListing(
    address nftAddress,
    uint256 tokenId
  ) external view returns (Listing memory) {
    return listings[nftAddress][tokenId];
  }

  function getProceeds(address seller) external view returns (uint256) {
    return proceeds[seller];
  }
}
