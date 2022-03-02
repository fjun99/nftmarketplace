import { expect } from "chai"
import { Signer } from "ethers"
import { ethers } from "hardhat"
import { BadgeToken } from  "../typechain"

const base64 = require( "base-64")

const _name='BadgeToken'
const _symbol='BADGE'

describe("BadgeToken", function () {

  let badge:BadgeToken
  let account0:Signer,account1:Signer
  
  beforeEach(async function () {
    [account0, account1] = await ethers.getSigners()
    const BadgeToken = await ethers.getContractFactory("BadgeToken")
    badge = await BadgeToken.deploy(_name,_symbol)
  })

  it("Should has the correct name and symbol ", async function () {
    expect(await badge.name()).to.equal(_name)
    expect(await badge.symbol()).to.equal(_symbol)
  })

  it("Should mint two token with token ID 1 & 2 to account1", async function () {
    const address1=await account1.getAddress()
    await badge.mintTo(address1)
    expect(await badge.ownerOf(1)).to.equal(address1)

    await badge.mintTo(address1)
    expect(await badge.ownerOf(2)).to.equal(address1)
    expect(await badge.balanceOf(address1)).to.equal(2)
  })

  it("Should mint a token with event", async function () {
    const address1=await account1.getAddress()
    await expect(badge.mintTo(address1))
    .to.emit(badge, 'Transfer')
    .withArgs(ethers.constants.AddressZero,address1, 1)
  })

  it("Should mint a token with desired tokenURI (log result for inspection)", async function () {
    const address1=await account1.getAddress()
    await badge.mintTo(address1)

    const tokenUri = await badge.tokenURI(1)
    // console.log("tokenURI:")
    // console.log(tokenUri)

    const tokenId = 1
    const data = base64.decode(tokenUri.slice(29))
    const itemInfo = JSON.parse(data)
    expect(itemInfo.name).to.be.equal('Badge #'+String(tokenId))
    expect(itemInfo.description).to.be.equal('Badge NFT with on-chain SVG image.')

    const svg = base64.decode(itemInfo.image.slice(26))
    const idInSVG = svg.slice(256,-13)
    expect(idInSVG).to.be.equal(String(tokenId))
    // console.log("SVG image:")
    // console.log(svg)
  })  

  it("Should mint 10 token with desired tokenURI", async function () {
    const address1=await account1.getAddress()
 
    for(let i=1;i<=10;i++){
      await badge.mintTo(address1)
      const tokenUri = await badge.tokenURI(i)

      const data = base64.decode(tokenUri.slice(29))
      const itemInfo = JSON.parse(data)
      expect(itemInfo.name).to.be.equal('Badge #'+String(i))
      expect(itemInfo.description).to.be.equal('Badge NFT with on-chain SVG image.')

      const svg = base64.decode(itemInfo.image.slice(26))
      const idInSVG = svg.slice(256,-13)
      expect(idInSVG).to.be.equal(String(i))
    }

    expect(await badge.balanceOf(address1)).to.equal(10)
  })  
})
