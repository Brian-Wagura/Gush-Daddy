const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// main function that contains our tests
describe("ETHDaddy", () => {
  let ethdaddy
  let deployer, owner1

  const NAME   = 'ETH Daddy'
  const SYMBOL = 'ETHD'

  beforeEach(async() => {
    // Setup accounts.
    [deployer, owner1] = await ethers.getSigners();

    // Deploy contract.
    const ETHDaddy = await ethers.getContractFactory('ETHDaddy')
    ethdaddy = await ETHDaddy.deploy(NAME, SYMBOL)

    // List a domain
    const transaction = await ethdaddy.connect(deployer).list("wagura.eth", tokens(10))
    await transaction.wait()


  }) 

  describe('Deployment', () => {
    it('has a name',  async ()=> {
      const result = await ethdaddy.name()
      expect(result).to.equal(NAME)
    })

    it('has a symbol',  async ()=> {
      const result = await ethdaddy.symbol()
      expect(result).to.equal(SYMBOL)
    })

    it('sets the owner',  async ()=> {
      const result = await ethdaddy.owner()
      expect(result).to.equal(deployer.address)
    })

    it('returns the max supply',  async ()=> {
      const result = await ethdaddy.maxSupply()
      expect(result).to.equal(1)
    })

    it('returns the total supply',  async ()=> {
      const result = await ethdaddy.totalSupply()
      expect(result).to.equal(0)
    })

    
  })

  describe('Domain', ()=> {
    it('returns domain attrib', async() => {
      let domain = await ethdaddy.getDomain(1);
      expect(domain.name).to.be.equal("wagura.eth")
      expect(domain.cost).to.be.equal(tokens(10))
      expect(domain.isOwned).to.be.equal(false)
    })
  })

  describe('Minting', ()=> {

    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')

    beforeEach(async() => {
      const transaction = await ethdaddy.connect(owner1).mint(ID, {value:AMOUNT})
      await transaction.wait()
    })

    it('Updates the owner', async() => {
      const owner = await ethdaddy.ownerOf(ID)
      expect(owner).to.be.equal(owner1.address)
    })

    it('Updates the domain status', async() => {
      const domain = await ethdaddy.getDomain(ID)
      expect(domain.isOwned).to.be.equal(true)
    })

    it('Updates the contract balance', async() => {
      const result = await ethdaddy.getBalance()
      expect(result).to.be.equal(AMOUNT)
    })
  })

  describe('Withdrawing', () => {

    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')
    let balanceBefore

    beforeEach( async() => {

      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await ethdaddy.connect(owner1).mint(ID, {value:AMOUNT})
      await transaction.wait()

      transaction = await ethdaddy.connect(deployer).withdraw()
      await transaction.wait()

    })

    it('Updates the owner balance', async() => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async() => {
      const result = await ethdaddy.getBalance()
      expect(result).to.equal(0)
    })



  })
})
