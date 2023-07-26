import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DECIMALS, INITIAL_PRICE } from '../helper-hardhat-config';

/**
 * This function handles deployment of our own priceFeed Aggregator contracts when working on the local network
 * 
 * @param hre The Hardhat Runtime Environment
 */
const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // If we are on a local development network, we need to deploy mocks!
  if (chainId == 31337) {
    log('Local network detected! Deploying mocks...');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log('Mocks Deployed!');
    log('---'.repeat(30));
    log(
      "You are deploying to a local network, you'll need a local network running to interact"
    );
    log(
      'Please run `yarn hardhat console` to interact with the deployed smart contracts!'
    );
    log('---'.repeat(30));
  }
};
export default deployMocks;
deployMocks.tags = ['all', 'mocks'];
