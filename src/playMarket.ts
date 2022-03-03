// src/playMarket.ts
import { Signer } from "ethers"
import { ethers } from "hardhat"
import { BadgeToken, NFTMarketplace } from  "../typechain"

const base64 = require( "base-64")

const _name='BadgeToken'
const _symbol='BADGE'

async function main() {

  let account0:Signer,account1:Signer
  [account0, account1] = await ethers.getSigners()
  const address0=await account0.getAddress()
  const address1=await account1.getAddress()

 
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

  // test transfer
  await nft.transferFrom(address0,address1,2)

  /* execute sale of token to another user */
  await market.connect(account1).createMarketSale(tokenAddress, 1, { value: auctionPrice})

  /* query for and return the unsold items */
  console.log("==after purchase & Transfer==")

  let items = await market.fetchActiveItems()
  let printitems
  printitems = await parseItems(items,nft)
  printitems.map((item)=>{printHelper(item,true,false)})
  // console.log( await parseItems(items,nft))

  console.log("==after delete==")
  await market.deleteMarketItem(3)

  items = await market.fetchActiveItems()
  printitems = await parseItems(items,nft)
  printitems.map((item)=>{printHelper(item,true,false)})
  // console.log( await parseItems(items,nft))

  console.log("==my list items==")
  items = await market.fetchMyCreatedItems()
  printitems = await parseItems(items,nft)
  printitems.map((item)=>{printHelper(item,true,false)})

  console.log("")
  console.log("==address1 purchased item (only one, tokenId =1)==")
  items = await market.connect(account1).fetchMyPurchasedItems()
  printitems = await parseItems(items,nft)
  printitems.map((item)=>{printHelper(item,true,true)})

}

async function parseItems(items:any,nft:BadgeToken) {
  let parsed=  await Promise.all(items.map(async (item:any) => {
    const tokenUri = await nft.tokenURI(item.tokenId)
    return {
      price: item.price.toString(),
      tokenId: item.tokenId.toString(),
      seller: item.seller,
      buyer: item.buyer,
      tokenUri
    }
  }))

  return parsed
}

function printHelper(item:any,flagUri=false,flagSVG=false){
  if(flagUri){
    const {name,description,svg}= parseNFT(item)
    console.log("id & name:",item.tokenId,name)
    if(flagSVG) console.log(svg)
  }else{
    console.log("id       :",item.tokenId)
  }
}

function parseNFT(item:any){
  const data = base64.decode(item.tokenUri.slice(29))
  const itemInfo = JSON.parse(data)
  const svg = base64.decode(itemInfo.image.slice(26))
  return(
    {"name":itemInfo.name,
     "description":itemInfo.description,
     "svg":svg})  
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
