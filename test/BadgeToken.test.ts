import { expect } from "chai"
import { Signer } from "ethers"
import { ethers } from "hardhat"
import { BadgeToken } from  "../typechain"

describe("BadgeToken", function () {

  let badge:BadgeToken
  // let badge:any
  const _name='BadgeToken'
  const _symbol='BADGE'
  let owner:Signer,account1:Signer,otheraccounts:Signer[]
  
  beforeEach(async function () {
    [owner, account1, ...otheraccounts] = await ethers.getSigners()

    /* deploy the marketplace */
    // const Market = await ethers.getContractFactory("NFTMarketplace")
    // const market = await Market.deploy()
    // await market.deployed()
    // const marketAddress = market.address

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
})
