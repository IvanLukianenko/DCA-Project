const hre = require("hardhat");
//const { ethers } = require("hardhat");

async function main() {
  let dcaOwner
  let user1
  let user2
  [dcaOwner, user1, user2] = await ethers.getSigners()
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
  const whaleUsdtAccountAddress = '0xF977814e90dA44bFA03b6295A0616a897441aceC'
  const whaleUsdtAccount = await ethers.getImpersonatedSigner(whaleUsdtAccountAddress);

  usdtErc20Token = await ethers.getContractAt(
    "IERC20",
    erc20TokenAdresses['USDT']
  )
  //daiErc20Token = await ethers.getContractAt(
  //  "IERC20",
  //  erc20TokenAdresses['DAI']
  //)
  const amount = ethers.parseUnits('1000', 6);
  console.log(amount)
  await usdtErc20Token.connect(whaleUsdtAccount).transfer(user1.address, amount)
  await usdtErc20Token.connect(whaleUsdtAccount).transfer(user2.address, amount)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });