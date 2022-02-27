import { expect } from "chai"
import { Signer } from "ethers"
import { ethers } from "hardhat"
import { BadgeToken } from  "../typechain"

describe("NFTMarketplace", function () {
  const _name='BadgeToken'
  const _symbol='BADGE'

  it("Should create and execute market sales", async function() {

    let owner:Signer,account1:Signer,otheraccounts:Signer[]
  
    [owner, account1, ...otheraccounts] = await ethers.getSigners()
  
    /* deploy the marketplace */
    const Market = await ethers.getContractFactory("NFTMarketplace")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    /* deploy the NFT contract */
    const NFT = await ethers.getContractFactory("BadgeToken")
    const nft:BadgeToken = await NFT.deploy(_name,_symbol)
    await nft.deployed()
    const nftContractAddress = nft.address
    // await nft.setApprovalForAll(marketAddress,true)

    console.log("marketAddress",marketAddress)
    console.log("nftContractAddress",nftContractAddress)

    /* create two tokens */
    const address0=await owner.getAddress()
    await nft.mintTo(address0)
    await nft.mintTo(address0)

    const listingFee = await market.getListingFee()
    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    await nft.approve(marketAddress,1)
    await nft.approve(marketAddress,2)
    console.log("Approve marketAddress",marketAddress)

    // /* put both tokens for sale */
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingFee })
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingFee })

    const [_, buyerAddress] = await ethers.getSigners()


    /* execute sale of token to another user */
    // await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice})

    /* query for and return the unsold items */
    let items = await market.fetchMarketItems()
    let printitem = await Promise.all(items.map(async (i:any) => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', printitem)

  })

})
