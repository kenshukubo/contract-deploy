const { ethers } = require("hardhat");

main()

async function main () {
  try {
    const nft = await ethers.getContractFactory('NFT')
    const contract = await nft.deploy("contract_name", "contract_symbol")

    console.info(`デプロイしたコントラクトアドレス: ${contract.address}`)
  } catch (err) {
    console.error(err)
  }
}