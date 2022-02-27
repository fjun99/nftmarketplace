import { ethers } from "hardhat"

async function main() {
  const Marketplace = await ethers.getContractFactory("NFTMarketplace")
  console.log('Deploying NFTMarketplace...')
  const marketplace = await Marketplace.deploy()

  await marketplace.deployed()
  console.log("NFTMarketplace deployed to:", marketplace.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
