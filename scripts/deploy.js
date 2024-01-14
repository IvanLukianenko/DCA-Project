// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

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

  const dca = await hre.ethers.deployContract(
    'dcaContract',
    [
      swapRouterAddress,
      erc20TokenAdresses['DAI'],
      erc20TokenAdresses['USDT'],
      erc20TokenAdresses['WETH'],
      ethPoolFeedAdresses['DAI'],
      ethPoolFeedAdresses['USDT']
    ])
  await dca.waitForDeployment()

  console.log(
    `deployed to ${dca.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
