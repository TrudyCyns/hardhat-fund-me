import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { networkConfig, developmentChains } from '../helper-hardhat-config';
import verify from '../utils/verify';

/**
 * This function handles deployment of the FundMe contract to the network
 *
 * @param hre The Hardhat Runtime Environment
 */
const deployFundMe: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre; // pull out (extrapolate) the variables you need from hre
  const { deploy, log } = deployments; // further pull out (extrapolate) variables you need from the deployments variable which is coming form the hre
  const { deployer } = await getNamedAccounts();
  const chainId: number = network.config.chainId!;

  // Use a mock when deploying to the local network
  let ethUsdPriceFeedAddress: string;

  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!;
  }
  log('---'.repeat(30));

  log(
    `Deploying FundMe and waiting for ${
      networkConfig[network.name].blockConfirmations
    } confirmations...`
  );
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`FundMe deployed at ${fundMe.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

export default deployFundMe;
deployFundMe.tags = ['all', 'fundMe'];
