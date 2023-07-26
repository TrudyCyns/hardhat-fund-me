import { ethers, getNamedAccounts } from 'hardhat';

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Got Fund me Contract at: ', fundMe.address);
  console.log('Funding contract ...');
  const txResponse = await fundMe.fund({
    value: ethers.utils.parseEther('0.05'),
  });
  await txResponse.wait();
  console.log('Funded!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
