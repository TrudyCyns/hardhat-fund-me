import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FundMe } from '../../typechain-types';
import { assert } from 'chai';
import { network, ethers } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';

// Staging tests are done on the testnet, so we have to check to make sure we're on the testnet. If not, the test should be skipped.

developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe Staging Tests', function () {
      let deployer: SignerWithAddress;
      let fundMe: FundMe;
      const sendValue = ethers.utils.parseEther('0.1');

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        fundMe = await ethers.getContract('FundMe', deployer);
      });

      it('Should allow people to fund and withdraw', async function () {
        const fundTxResponse = await fundMe.fund({ value: sendValue });
        await fundTxResponse.wait(1);
        const withdrawTxResponse = await fundMe.withdraw();
        await withdrawTxResponse.wait(1);

        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        console.log(
          endingFundMeBalance.toString() +
            ' should equal 0, running assert equal...'
        );
        assert.equal(endingFundMeBalance.toString(), '0');
      });
    });
