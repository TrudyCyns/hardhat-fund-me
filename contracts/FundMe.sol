// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import './PriceConverter.sol';

// Error Codes here
error Funder__NotOwner();

// Interfaces and Libraries come next

/**
 * @title FundMe - A contract for crowdfunding
 * @author Trudy
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
  // Type declarations next
  using PriceConverter for uint256;

  // State variables next
  mapping(address => uint256) private s_addressToAmountFunded;
  address[] private s_funders;
  address private immutable i_owner;
  uint256 public constant minimumUSD = 50 * 10 ** 18;
  AggregatorV3Interface private s_priceFeed;

  // Modifiers next
  modifier onlyOwner() {
    require(msg.sender == i_owner);
    _;
  }

  // Functions next. Order: constructor, receive, fallback, external, public, internal, private, view/pure
  // Have the constructor take the Price Feed address as an argument. This helps modularise the PriceFeed AggregatorV3Interface address
  constructor(address priceFeed) {
    s_priceFeed = AggregatorV3Interface(priceFeed);
    i_owner = msg.sender;
  }

  /**
   * @notice This function funds the contract
   * @dev This implements price feeds as our library
   */
  function fund() public payable {
    require(
      msg.value.getConversionRate(s_priceFeed) >= minimumUSD,
      'You need to spend more ETH!'
    );
    // require(PriceConverter.getConversionRate(msg.value) >= minimumUSD, "You need to spend more ETH!");
    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  function withdraw() public payable onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
  }

  function cheaperWithdraw() public payable onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
    address[] memory funders = s_funders;
    // mappings can't be in memory, sorry!
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
  }

  // Make variables private and provide gettter functions for them
  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getFunder(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getAddressToAmountFunded(
    address funder
  ) public view returns (uint256) {
    return s_addressToAmountFunded[funder];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
