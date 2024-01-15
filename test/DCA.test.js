const { expect } = require("chai")
const { ethers } = require("hardhat");
const {
  loadFixture
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("DCA Investing Contract", function () {
  let dcaOwner
  let user1
  let user2

  const erc20TokenAdresses = {
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  }

  const ethPoolFeedAdresses = {
    'DAI': '0x773616E4d11A78F511299002da57A0a94577F1f4',
    'USDT': '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46'
  }

  const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
  const whaleAccountAddress = '0x1234567890123456789012345678901234567890'

  const BALANCE = 100000000;
  const purchaseAmount = 1000000;
  const purchaseIterval = 100;
  const poolFee = 3000;

  let usdtErc20Token
  let daiErc20Token
  let wethErc20Token

  async function deployDcaContractFixture() {
    [dcaOwner, user1, user2] = await ethers.getSigners()
    const dca = await ethers.deployContract(
      'dcaContract',
      [
        swapRouterAddress,
        erc20TokenAdresses['DAI'],
        erc20TokenAdresses['USDT'],
        erc20TokenAdresses['WETH'],
        ethPoolFeedAdresses['DAI'],
        ethPoolFeedAdresses['USDT']
      ], {signer:dcaOwner})
    await dca.waitForDeployment()

    const whaleAccount = await ethers.getImpersonatedSigner(whaleAccountAddress);

    usdtErc20Token = await ethers.getContractAt(
      "IERC20",
      erc20TokenAdresses['USDT']
    )
    daiErc20Token = await ethers.getContractAt(
      "IERC20",
      erc20TokenAdresses['DAI']
    )

    await usdtErc20Token.connect(whaleAccount).transfer(user1.address, BALANCE)
    await usdtErc20Token.connect(whaleAccount).transfer(user2.address, BALANCE)

    await daiErc20Token.connect(whaleAccount).transfer(user1.address, BALANCE)
    await daiErc20Token.connect(whaleAccount).transfer(user2.address, BALANCE)

    return dca
  }

  describe("Deploying, setting, getting, depositting", function() {
    it("should be deployed", async function() {
      const dca = await loadFixture(deployDcaContractFixture)
      expect(dca.target).to.be.properAddress
    })

    it("should set and get params of sender", async function(){
      const dca = await loadFixture(deployDcaContractFixture)
      await dca.connect(user1).setDcaParams(
        [
          erc20TokenAdresses['USDT'],
          erc20TokenAdresses['WETH'],
          poolFee
        ],
        [
          purchaseAmount,
          purchaseIterval
        ]
      )
      const result = await dca.connect(user1).getDcaParams(
        [
          erc20TokenAdresses['USDT'],
          erc20TokenAdresses['WETH'],
          poolFee
        ]
      )
      const { 0: userPurchaseAmount, 1: userPurchaseInterval} = result
      expect(userPurchaseAmount).to.be.equal(purchaseAmount)
      expect(userPurchaseInterval).to.be.equal(purchaseIterval)
    })

  it("should not set and get params of another user sender", async function() {
    const dca = await loadFixture(deployDcaContractFixture)
    await dca.connect(user1).setDcaParams(
      [
        erc20TokenAdresses['USDT'],
        erc20TokenAdresses['WETH'],
        poolFee
      ],
      [
        purchaseAmount,
        purchaseIterval
      ]
    )
    const result = await dca.connect(user2).getDcaParams(
      [
        erc20TokenAdresses['USDT'],
        erc20TokenAdresses['WETH'],
        poolFee
      ]
    )
    const { 0: userPurchaseAmount, 1: userPurchaseInterval} = result
    expect(userPurchaseAmount).to.be.equal(0)
    expect(userPurchaseInterval).to.be.equal(0)
  })

  it('should give users ability to deposit usdt tokens', async function() {
    const dca = await loadFixture(deployDcaContractFixture)

    const depositedUsdtAmount = BALANCE / 10
    await usdtErc20Token.connect(user1).approve(dca.target, depositedUsdtAmount)

    await dca.connect(user1).deposit(
      erc20TokenAdresses['USDT'],
      depositedUsdtAmount
    )

    const userUsdtBalance = await dca.connect(user1).getBalance(erc20TokenAdresses['USDT'])
    const userDaiBalance = await dca.connect(user2).getBalance(erc20TokenAdresses['DAI'])

    expect(userUsdtBalance).to.be.equal(depositedUsdtAmount)
    expect(userDaiBalance).to.be.equal(0)
  })
})

  describe("Getting price from @chainlink contracts", function() {

    it("should not return zero for dai/eth price", async function() {
      const dca = await loadFixture(deployDcaContractFixture)
      const { 0: daiEthPrice, 1: decimals } = await dca.getLatestPrice(erc20TokenAdresses['DAI'])
      expect(daiEthPrice).not.to.be.equal(0);
    })

    it("should not return zero for usdt/eth price", async function() {
      const dca = await loadFixture(deployDcaContractFixture)
      const { 0: usdtEthPrice, 1: decimals } = await dca.getLatestPrice(erc20TokenAdresses['USDT'])
      expect(usdtEthPrice).not.to.be.equal(0);
    })

  })
  
  describe("Swapping tokens", function() {
    it("should be able to swap tokens", async function() {
      const dca = await loadFixture(deployDcaContractFixture)
      await dca.connect(user1).setDcaParams(
        [
          erc20TokenAdresses['USDT'],
          erc20TokenAdresses['WETH'],
          poolFee
        ],
        [
          purchaseAmount,
          purchaseIterval
        ]
      )
      const depositedUsdtAmount = BALANCE / 10

      await usdtErc20Token.connect(user1).approve(dca.target, depositedUsdtAmount)

      await dca.connect(user1).deposit(
        erc20TokenAdresses['USDT'],
        depositedUsdtAmount
      )
      const userDcaParams = await dca.connect(user1).getDcaParams(
        [
          erc20TokenAdresses['USDT'],
          erc20TokenAdresses['WETH'],
          poolFee
        ]
      )
      const { 0: userPurchaseAmount, 1: userPurchaseInterval} = userDcaParams
      await dca.connect(user1).executeDca(
        [
          erc20TokenAdresses['USDT'],
          erc20TokenAdresses['WETH'],
          poolFee
        ]
      )
      wethErc20Token = await ethers.getContractAt(
        "IERC20",
        erc20TokenAdresses['WETH']
      )
      const wethUserBalance = await wethErc20Token.balanceOf(user1)
      expect(wethUserBalance).to.be.equal(userPurchaseAmount)
    })
  })
})