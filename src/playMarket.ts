import { Signer } from "ethers"
import { ethers } from "hardhat"
import { BadgeToken, NFTMarketplace } from  "../typechain"

// const tokenAddress='0x5FbDB2315678afecb367f032d93F642f64180aa3'
// const marketAddress='0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const _name='BadgeToken'
const _symbol='BADGE'

async function main() {

  let owner:Signer,account1:Signer,otheraccounts:Signer[]
  
  [owner, account1, ...otheraccounts] = await ethers.getSigners()

  // const market:NFTMarketplace = await ethers.getContractAt("NFTMarketplace", marketAddress)
  // const nft:BadgeToken = await ethers.getContractAt("BadgeToken", tokenAddress)

  /* deploy the marketplace */
  const Market = await ethers.getContractFactory("NFTMarketplace")
  const market:NFTMarketplace = await Market.deploy()
  await market.deployed()
  const marketAddress = market.address
  
  /* deploy the NFT contract */
  const NFT = await ethers.getContractFactory("BadgeToken")
  const nft:BadgeToken = await NFT.deploy(_name,_symbol)
  await nft.deployed()
  const tokenAddress = nft.address
  
  console.log("marketAddress",marketAddress)
  console.log("nftContractAddress",tokenAddress)

  /* create two tokens */
  const address0=await owner.getAddress()
  await nft.mintTo(address0) //'1'
  await nft.mintTo(address0) //'2' 
  await nft.mintTo(address0) //'3'

  const listingFee = await market.getListingFee()
  const auctionPrice = ethers.utils.parseUnits('1', 'ether')

  await nft.approve(marketAddress,1)
  await nft.approve(marketAddress,2)
  await nft.approve(marketAddress,3)
  console.log("Approve marketAddress",marketAddress)

  // /* put both tokens for sale */
  await market.createMarketItem(tokenAddress, 1, auctionPrice, { value: listingFee })
  await market.createMarketItem(tokenAddress, 2, auctionPrice, { value: listingFee })
  await market.createMarketItem(tokenAddress, 3, auctionPrice, { value: listingFee })

  const [_, buyerAddress] = await ethers.getSigners()

  // test transfer
  await nft.transferFrom(await owner.getAddress(),await account1.getAddress(),2)

  /* execute sale of token to another user */
  await market.connect(buyerAddress).createMarketSale(tokenAddress, 1, { value: auctionPrice})

  /* query for and return the unsold items */
  console.log("==after purchase & Transfer==")

  let items = await market.fetchActiveItems()
  console.log( await parseItems(items,nft))

  console.log("==after delete==")
  await market.deleteMarketItem(3)

  // should revert
  // await market.connect(buyerAddress).deleteMarketItem(3)

  items = await market.fetchActiveItems()
  console.log( await parseItems(items,nft))

  console.log("==my list items==")
  items = await market.fetchMyCreatedItems()
  console.log( await parseItems(items,nft))


  console.log("==address1 purchased items==")
  items = await market.connect(buyerAddress).fetchMyPurchasedItems()
  console.log( await parseItems(items,nft))

}

async function parseItems(items:any,nft:BadgeToken) {
  let parsed=  await Promise.all(items.map(async (item:any) => {
    const tokenUri = await nft.tokenURI(item.tokenId)
    return {
      // price: item.price.toString(),
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      buyer: item.buyer,
      // tokenUri
    }
  }))

  return parsed
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
