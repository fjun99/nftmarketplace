import { expect } from "chai"
import { BigNumber, Signer } from "ethers"
import { ethers } from "hardhat"
import { BadgeToken, NFTMarketplace } from  "../typechain"

const _name='BadgeToken'
const _symbol='BADGE'

describe("NFTMarketplace", function () {
  let nft:BadgeToken
  let market:NFTMarketplace
  let account0:Signer,account1:Signer,account2:Signer
  let address0:string, address1:string, address2:string

  let listingFee:BigNumber
  const auctionPrice = ethers.utils.parseUnits('1', 'ether')

  beforeEach(async function () {
    [account0, account1, account2] = await ethers.getSigners()
    address0 = await account0.getAddress()
    address1 = await account1.getAddress()
    address2 = await account2.getAddress()

    const BadgeToken = await ethers.getContractFactory("BadgeToken")
    nft = await BadgeToken.deploy(_name,_symbol)
    // tokenAddress = nft.address

    const Market = await ethers.getContractFactory("NFTMarketplace")
    market = await Market.deploy()
    listingFee = await market.getListingFee()

  })

  it("Should create market item successfully", async function() {
    await nft.mintTo(address0)  //tokenId=1
    await nft.approve(market.address,1)
    await market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee })

  })

  it("Should create market item with EVENT", async function() {
    await nft.mintTo(address0)  //tokenId=1
    await nft.approve(market.address,1)
    await expect(market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee }))
      .to.emit(market, 'MarketItemCreated')
      .withArgs(
        1,
        nft.address,
        1,
        address0,
        ethers.constants.AddressZero,
        auctionPrice, 
        0)
  })

  it("Should revert to create market item if nft is not approved", async function() {
    await nft.mintTo(address0)  //tokenId=1
    // await nft.approve(market.address,1)
    await expect(market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee }))
      .to.be.revertedWith('NFT must be approved to market')
  })

  it("Should create market item and buy (by address#1) successfully", async function() {
    await nft.mintTo(address0)  //tokenId=1
    await nft.approve(market.address,1)
    await market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee })

    await market.connect(account1).createMarketSale(nft.address, 1, { value: auctionPrice})

  })

  it("Should revert buy if seller remove approve", async function() {
    await nft.mintTo(address0)  //tokenId=1
    await nft.approve(market.address,1)
    await market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee })

    await nft.approve(ethers.constants.AddressZero,1)

    await expect(market.connect(account1).createMarketSale(nft.address, 1, { value: auctionPrice}))
      .to.be.reverted
  })

  it("Should revert buy if seller transfer the token out", async function() {
    await nft.mintTo(address0)  //tokenId=1
    await nft.approve(market.address,1)
    await market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee })

    await nft.transferFrom(address0,address2,1)

    await expect(market.connect(account1).createMarketSale(nft.address, 1, { value: auctionPrice}))
      .to.be.reverted
  })

  it("Should revert to delete(de-list) with wrong params", async function() {
    await nft.mintTo(address0)  //tokenId=1
    await nft.approve(market.address,1)
    await market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee })

    //not a correct id
    await expect(market.deleteMarketItem(2)).to.be.reverted

    //not owner
    await expect(market.connect(account1).deleteMarketItem(1)).to.be.reverted

    await nft.transferFrom(address0,address1,1)
    //not approved to market now
    await expect(market.deleteMarketItem(1)).to.be.reverted
  })

  it("Should create market item and delete(de-list) successfully (!!TODO)", async function() {
    await nft.mintTo(address0)  //tokenId=1
    await nft.approve(market.address,1)

    await market.createMarketItem(nft.address, 1, auctionPrice, { value: listingFee })
    await market.deleteMarketItem(1)

    //TODO
    //currently: remove approve by ourself instead of relying on Marketpalce contract
    await nft.approve(ethers.constants.AddressZero,1)

    // should revert if trying to delete again
    await expect(market.deleteMarketItem(1))
      .to.be.reverted
  })

})
