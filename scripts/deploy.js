// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // setup accounts and variables
  const [deployer] = await ethers.getSigners()
  const NAME   = 'ETH Daddy'
  const SYMBOL = 'ETHD'

  // deploy contract
  const ETHDaddy = await ethers.getContractFactory('ETHDaddy')
  const ethdaddy = await ETHDaddy.deploy(NAME,SYMBOL)
  await ethdaddy.deployed();

  console.log(`Deployed Domain Contract at: ${ethdaddy.address}\n`)

  // list domains
  const names = ['wagura.eth', 'facebook.eth', 'wikileaks.eth','google.eth', 'instagram.eth', 'snapchat.eth']
  const costs = [tokens(1),tokens(10),tokens(11),tokens(9),tokens(11),tokens(8)]

  for ( var i = 0; i<6; i++){
    const transaction = await ethdaddy.connect(deployer).list(names[i], costs[i])
    await transaction.wait()

    console.log(`Listed Domain ${i +1}:${names[i]}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
