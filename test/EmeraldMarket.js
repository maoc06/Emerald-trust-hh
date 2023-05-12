const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Emerald NFT Marketplace", () => {
  let nftMarket, emeraldNft, owner, addr1, addr2;
  const PRICE = ethers.utils.parseEther("0.1");
  const TOKEN_ID = 0;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const nftMarketContract = await ethers.getContractFactory("EmeraldMarket");
    const emeraldNftContract = await ethers.getContractFactory("EmeraldNtf");

    nftMarket = await nftMarketContract.deploy();
    emeraldNft = await emeraldNftContract.deploy();

    await emeraldNft.mintNft();
    await emeraldNft.approve(nftMarket.address, TOKEN_ID);
  });

  describe("List NFT Emerald", function () {
    it("Should emits an event after listing an item", async () => {
      expect(
        await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE)
      ).to.emit("ItemListed");
    });

    it("Should not be listed because it is already listed", async () => {
      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);
      await expect(
        nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE)
      ).to.be.revertedWith("NTF Emerald already listed");
    });

    it("Exclusively allows owners to list", async () => {
      nftMarket = nftMarket.connect(addr1);
      await expect(
        nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE)
      ).to.be.revertedWith("Not owner");
    });

    it("Needs approvals to list item", async () => {
      await emeraldNft.approve(ethers.constants.AddressZero, TOKEN_ID);
      await expect(
        nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE)
      ).to.be.revertedWith("Emerald NTF not approved for marketplace");
    });
  });

  describe("Cancel listing", function () {
    it("Should revert because it is not listed", async function () {
      await expect(
        nftMarket.cancelListing(emeraldNft.address, TOKEN_ID)
      ).to.be.revertedWith("Not listed");
    });

    it("Should revert because are not the owner", async function () {
      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);

      nftMarket = nftMarket.connect(addr1);
      await emeraldNft.approve(addr1.address, TOKEN_ID);

      await expect(
        nftMarket.cancelListing(emeraldNft.address, TOKEN_ID)
      ).to.be.revertedWith("Not owner");
    });

    it("Shoul emits event and removes listing", async function () {
      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);

      expect(
        await nftMarket.cancelListing(emeraldNft.address, TOKEN_ID)
      ).to.emit("ItemCanceled");

      const listing = await nftMarket.getListing(emeraldNft.address, TOKEN_ID);
      assert(listing.price.toString() == "0");
    });
  });

  describe("Buy NFT Emerald", () => {
    it("Should not be able to buy it because it is not listed", async () => {
      await expect(
        nftMarket.buyItem(emeraldNft.address, TOKEN_ID)
      ).to.be.revertedWith("Not listed");
    });

    it("Should revert because price not met", async () => {
      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);
      await expect(
        nftMarket.buyItem(emeraldNft.address, TOKEN_ID, {
          value: ethers.utils.parseEther("0.01"),
        })
      ).to.be.revertedWith("NTF Emerald price not met");
    });

    it("Should transfer the Emerald NFT to the buyer and updates internal proceeds record", async () => {
      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);

      nftMarket = await nftMarket.connect(addr1);

      expect(
        await nftMarket.buyItem(emeraldNft.address, TOKEN_ID, {
          value: PRICE,
        })
      ).to.emit("ItemBought");

      const newOwner = await emeraldNft.ownerOf(TOKEN_ID);
      const oldOwnerProceeds = await nftMarket.getProceeds(owner.address);

      assert(newOwner.toString() == addr1.address);
      assert(oldOwnerProceeds.toString() == PRICE.toString());
    });
  });

  describe("Update Listing", function () {
    it("Should not update because it is not listed", async function () {
      await expect(
        nftMarket.updateListing(emeraldNft.address, TOKEN_ID, PRICE)
      ).to.be.revertedWith("Not listed");
    });

    it("Should not update because are not the owner", async function () {
      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);

      nftMarket = nftMarket.connect(addr1);

      await expect(
        nftMarket.updateListing(emeraldNft.address, TOKEN_ID, PRICE)
      ).to.be.revertedWith("Not owner");
    });

    it("Should update the price of the item", async function () {
      const updatedPrice = ethers.utils.parseEther("0.2");

      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);

      expect(
        await nftMarket.updateListing(
          emeraldNft.address,
          TOKEN_ID,
          updatedPrice
        )
      ).to.emit("ItemListed");

      const listing = await nftMarket.getListing(emeraldNft.address, TOKEN_ID);
      assert(listing.price.toString() == updatedPrice.toString());
    });
  });

  describe("Withdrawal of proceeds", () => {
    it("Should not be able to withdraw proceeds because it is equal to zero.", async () => {
      await expect(nftMarket.withdrawProceeds()).to.be.revertedWith(
        "No proceeds to withdraw"
      );
    });

    it("Should withdraw proceeds", async () => {
      await nftMarket.listItem(emeraldNft.address, TOKEN_ID, PRICE);

      nftMarket = await nftMarket.connect(addr1);
      expect(
        await nftMarket.buyItem(emeraldNft.address, TOKEN_ID, {
          value: PRICE,
        })
      ).to.emit("ItemBought");

      nftMarket = nftMarket.connect(owner);
      const ownerProceeds = await nftMarket.getProceeds(owner.address);
      assert(ownerProceeds.toString() == PRICE.toString());

      const balanceBefore = await owner.getBalance();

      const txResponse = await nftMarket.withdrawProceeds();
      const txReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = txReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const balanceAfter = await owner.getBalance();

      assert(
        balanceAfter.add(gasCost).toString() ==
          ownerProceeds.add(balanceBefore).toString()
      );
    });
  });
});
