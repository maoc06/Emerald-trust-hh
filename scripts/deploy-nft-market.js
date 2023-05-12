async function main() {
  const EmeraldMarket = await ethers.getContractFactory("EmeraldMarket")
  const emeraldMarket = await EmeraldMarket.deploy()

  await emeraldMarket.deployed()

  console.log(`Emerald Manager deployed: ${emeraldMarket.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
