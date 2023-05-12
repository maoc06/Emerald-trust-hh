// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EmeraldNtf is ERC721 {
  uint256 private tokenCounter;

  event EmrMinted(uint256 indexed tokenId);

  constructor() ERC721("Emerald", "EMR") {
    tokenCounter = 0;
  }

  function mintNft() public {
    _safeMint(msg.sender, tokenCounter);
    emit EmrMinted(tokenCounter);
    tokenCounter = tokenCounter + 1;
  }

  function getTokenCounter() public view returns (uint256) {
    return tokenCounter;
  }
}
