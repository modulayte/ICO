pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundVault.sol';
import './ModulayteToken.sol';

//*****************************************************
// *   ModulayteCrowdsale
// *   Info:
//     - Sale will be for x total tokens
//     - Funding during presale determines price
//     - Times are in UTC (seconds since Jan 1 1970)
//
//*****************************************************
contract ModulayteCrowdsale is Ownable{
  using SafeMath for uint256;

  //***************************************************
  //  Settings
  //***************************************************

  // minimum amount of funds to be raised in weis
  uint256 private minGoal;// = 0;

  // Tokens for crowdsale
  uint256 private tokenLimitCrowdsale;//  = 0;

  // Presale discount for each phase
  uint256 private crowdsaleDiscount0;// = 0;
  uint256 private crowdsaleDiscount1;// = 0;
  uint256 private crowdsaleDiscount2;// = 0;
  uint256 private crowdsaleDiscount3;// = 0;
  uint256 private crowdsaleDiscount4;// = 0;

  // durations for each phase
  uint256 private  crowdsaleDuration0;// = 0;//604800; // One Week in seconds
  uint256 private  crowdsaleDuration1;// = 0;//604800; // One Week in seconds
  uint256 private  crowdsaleDuration2;// = 0;//604800; // One Week in seconds
  uint256 private  crowdsaleDuration3;// = 0;//604800; // One Week in seconds
  uint256 private  crowdsaleDuration4;// = 0;//604800; // One Week in seconds

  //***************************************************
  //  Info
  //***************************************************

  // Backers
  uint256 private totalBackers;//  = 0;

  // amount of raised money in wei
  uint256 private weiRaisedCs0;// = 0;
  uint256 private weiRaisedCs1;// = 0;
  uint256 private weiRaisedCs2;// = 0;
  uint256 private weiRaisedCs3;// = 0;
  uint256 private weiRaisedCs4;// = 0;

  // prices for each phase
  uint256 private crowdsaleTokenPrice0;//    = 0;
  uint256 private baseTokenPrice;// = 0;
  uint256 private crowdsaleTokenPrice1;// = 0;
  uint256 private crowdsaleTokenPrice2;// = 0;
  uint256 private crowdsaleTokenPrice3;// = 0;
  uint256 private crowdsaleTokenPrice4;// = 0;

  // Count of token distributions by phase
  uint256 private crowdsaleTokenSent0;//     = 0;
  uint256 private crowdsaleTokenSent1;//  = 0;
  uint256 private crowdsaleTokenSent2;//  = 0;
  uint256 private crowdsaleTokenSent3;//  = 0;
  uint256 private crowdsaleTokenSent4;//  = 0;

  //***************************************************
  //  Vars
  //***************************************************

  // Finalization Flag
  bool private finalized = false;

  // Halted Flag
  bool private halted = false;

  // Time to open
  uint256 public startTime;

  // The token being sold
  ModulayteToken public modulayteToken;

  // Address where funds are collected
  address private wallet;

  // refund vault used to hold funds while crowdsale is running
  RefundVault private vault;

  // tracking for deposits
  // sha3 of address and phase id
  mapping (bytes32 => uint256) public deposits;

  //***************************************************
  //  Events
  //***************************************************

  // Log event for presale purchase
  event TokenDeposit(address indexed Purchaser, address indexed Beneficiary, uint256 ValueInWei);

  // Log event for distribution of tokens for presale purchasers
  event TokenDistribution(address indexed Purchaser, address indexed Beneficiary, uint256 TokenAmount);

  // Finalization
  event Finalized();

  //***************************************************
  //  Constructor
  //***************************************************
  function ModulayteCrowdsale() {
    // empty contructor to make deployment cheaper
  }

  //***************************************************
  //  Initialization function
  //***************************************************
  function StartCrowdsale(address _token, address _wallet, uint256 _startTime) onlyOwner{
    require(_startTime >= now);
    require(_token != 0x0);
    require(_wallet != 0x0);

    // Set the start time
    startTime = _startTime;

    // Assign the token
    modulayteToken = ModulayteToken(_token);

    // Wallet for funds
    wallet = _wallet;

    // Refund vault
    vault = new RefundVault(wallet);

    // minimum amount of funds to be raised in weis
    //minGoal = 5000 * 10**18; // Approx 1M Dollars
    minGoal = 10 * 10**18; // Approx 1M Dollars

    // Tokens for crowdsale
    tokenLimitCrowdsale  = 300000000 * 10**18;
    //tokenLimitCrowdsale  = 10 * 10**18;

    // Presale discount for each phase
    crowdsaleDiscount0 = 25 * 10**16;  // 25%
    crowdsaleDiscount1 = 15 * 10**16;  // 15%
    crowdsaleDiscount2 = 10 * 10**16;  // 10%
    crowdsaleDiscount3 =  5 * 10**16;  //  5%
    crowdsaleDiscount4 =           0;  //  0%

    // durations for each phase
    crowdsaleDuration0 = 30;//604800; // One Week in seconds
    crowdsaleDuration1 = 30;//604800; // One Week in seconds
    crowdsaleDuration2 = 30;//604800; // One Week in seconds
    crowdsaleDuration3 = 30;//604800; // One Week in seconds
    crowdsaleDuration4 = 30;//604800; // One Week in seconds

  }

  //***************************************************
  //  Runtime state checks
  //***************************************************

  function currentStateActive() public constant returns ( bool presaleWaitPhase,
                                                          bool crowdsalePhase0,
                                                          bool crowdsalePhase1,
                                                          bool crowdsalePhase2,
                                                          bool crowdsalePhase3,
                                                          bool crowdsalePhase4,
                                                          bool buyable,
                                                          bool reachedEtherMinimumGoal,
                                                          bool completed,
                                                          bool finalizedAndClosed,
                                                          bool Halted){

    return (  isPresaleWaitPhase(),
              isCrowdsalePhase0(),
              isCrowdsalePhase1(),
              isCrowdsalePhase2(),
              isCrowdsalePhase3(),
              isCrowdsalePhase4(),
              isBuyable(),
              minimumGoalReached(),
              isCompleted(),
              finalized,
              halted);
  }

  function currentStateSales() public constant returns (uint256 BaseTokenPrice,
                                                        uint256 CrowdsaleTokenPrice0,
                                                        uint256 CrowdsaleTokenPrice1,
                                                        uint256 CrowdsaleTokenPrice2,
                                                        uint256 CrowdsaleTokenPrice3,
                                                        uint256 CrowdsaleTokenPrice4,
                                                        uint256 TotalBackers,
                                                        uint256 WeiRaised,
                                                        address Wallet,
                                                        uint256 GoalInWei,
                                                        uint256 RemainingTokens){

    return (  baseTokenPrice,
              crowdsaleTokenPrice0,
              crowdsaleTokenPrice1,
              crowdsaleTokenPrice2,
              crowdsaleTokenPrice3,
              crowdsaleTokenPrice4,
              totalBackers,
              totalWeiRaised(),
              wallet,
              minGoal,
              getContractTokenBalance());
  }

  function currentTokenDistribution() public constant returns (uint256 CrowdsalePhase0Tokens,
                                                               uint256 CrowdsalePhase1Tokens,
                                                               uint256 CrowdsalePhase2Tokens,
                                                               uint256 CrowdsalePhase3Tokens,
                                                               uint256 CrowdsalePhase4Tokens){

    return (  crowdsaleTokenSent0,
              crowdsaleTokenSent1,
              crowdsaleTokenSent2,
              crowdsaleTokenSent3,
              crowdsaleTokenSent4);
  }

  function isPresaleWaitPhase() internal constant returns (bool){
    return startTime >= now;
  }

  function isCrowdsalePhase0() internal constant returns (bool){
    return startTime < now && (startTime + crowdsaleDuration0) >= now;
  }

  function isCrowdsalePhase1() internal constant returns (bool){
    return (startTime + crowdsaleDuration0) < now && (startTime + crowdsaleDuration0 + crowdsaleDuration1) >= now;
  }

  function isCrowdsalePhase2() internal constant returns (bool){
    return (startTime + crowdsaleDuration0 + crowdsaleDuration1) < now && (startTime + crowdsaleDuration0 + crowdsaleDuration1 + crowdsaleDuration2) >= now;
  }

  function isCrowdsalePhase3() internal constant returns (bool){
    return (startTime + crowdsaleDuration0 + crowdsaleDuration1 + crowdsaleDuration2) < now && (startTime + crowdsaleDuration0 + crowdsaleDuration1 + crowdsaleDuration2 + crowdsaleDuration3) >= now;
  }

  function isCrowdsalePhase4() internal constant returns (bool){
    return (startTime + crowdsaleDuration0 + crowdsaleDuration1 + crowdsaleDuration2 + crowdsaleDuration3) < now && (startTime + crowdsaleDuration0 + crowdsaleDuration1 + crowdsaleDuration2 + crowdsaleDuration3 + crowdsaleDuration4) >= now;
  }

  function isCompleted() internal constant returns (bool){
    return (startTime + crowdsaleDuration0 + crowdsaleDuration1 + crowdsaleDuration2 + crowdsaleDuration3 + crowdsaleDuration4) < now;
  }

  function isBuyable() internal constant returns (bool){
    return startTime < now && !isCompleted();
  }

  function minimumGoalReached() internal constant returns (bool) {
    return totalWeiRaised() >= minGoal;
  }

  function currentPhaseNumber() internal constant returns (uint256){
    if (isPresaleWaitPhase()){
      return 0;
    }else if (isCrowdsalePhase0()){
      return 1;
    }else if (isCrowdsalePhase1()){
      return 2;
    }else if (isCrowdsalePhase2()){
      return 3;
    }else if (isCrowdsalePhase3()){
      return 4;
    }else if (isCrowdsalePhase4()){
      return 5;
    }else if (isCompleted()){
      return 6;
    }else{
      return 0;
    }
  }

  function totalWeiRaised() internal constant returns (uint256){
    uint256 totalIn = weiRaisedCs0 + weiRaisedCs1 + weiRaisedCs2 + weiRaisedCs3 + weiRaisedCs4;
    return (totalIn);
  }

  function getContractTokenBalance() internal constant returns (uint256) {
    return modulayteToken.balanceOf(this);
  }

  function phaseDeposits() constant returns (uint256, uint256, uint256, uint256, uint256){//, uint256, uint256, uint256, uint256, uint256){

    return(weiRaisedCs0, weiRaisedCs1, weiRaisedCs2, weiRaisedCs3, weiRaisedCs4);
  }

  //***************************************************
  //  Emergency functions
  //***************************************************
  function halt() onlyOwner{
    halted = true;
  }

  function unHalt() onlyOwner{
    halted = false;
  }

  //***************************************************
  //  Update all the prices
  //***************************************************
  function updatePrices() internal {

    uint256 totalDiscountedIn = weiRaisedCs0.mul(1 ether).div( (1 ether) - (crowdsaleDiscount0) ) +
                                weiRaisedCs1.mul(1 ether).div( (1 ether) - (crowdsaleDiscount1) ) +
                                weiRaisedCs2.mul(1 ether).div( (1 ether) - (crowdsaleDiscount2) ) +
                                weiRaisedCs3.mul(1 ether).div( (1 ether) - (crowdsaleDiscount3) ) +
                                weiRaisedCs4.mul(1 ether).div( (1 ether) - (crowdsaleDiscount4) );

    baseTokenPrice = totalDiscountedIn.mul(1 ether).div(tokenLimitCrowdsale);

    crowdsaleTokenPrice0 = baseTokenPrice - ((baseTokenPrice * crowdsaleDiscount0)/(1 ether));
    crowdsaleTokenPrice1 = baseTokenPrice - ((baseTokenPrice * crowdsaleDiscount1)/(1 ether));
    crowdsaleTokenPrice2 = baseTokenPrice - ((baseTokenPrice * crowdsaleDiscount2)/(1 ether));
    crowdsaleTokenPrice3 = baseTokenPrice - ((baseTokenPrice * crowdsaleDiscount3)/(1 ether));
    crowdsaleTokenPrice4 = baseTokenPrice - ((baseTokenPrice * crowdsaleDiscount4)/(1 ether));
  }

  //***************************************************
  //  Default presale and token purchase
  //***************************************************
  function () payable {

    if(msg.value == 0 && isCompleted())
    {
      // distribute if sale is over
      distributePresale(msg.sender);
    }else{
      // Presale deposit
      depositPresale(msg.sender);
    }
  }

  //***************************************************
  //  Low level deposit
  //***************************************************
  function depositPresale(address beneficiary) payable {
    require(isBuyable());
    require(!halted);
    require(beneficiary != 0x0);
    require(msg.value != 0);

    // Amount invested
    uint256 weiAmount = msg.value;

    // Send funds to main wallet
    forwardFunds();

    // Total innvested so far
    if (isCrowdsalePhase0()){
      weiRaisedCs0 += weiAmount;
      deposits[sha3(beneficiary, 1)] += weiAmount;
    }else if (isCrowdsalePhase1()){
      weiRaisedCs1 += weiAmount;
      deposits[sha3(beneficiary, 2)] += weiAmount;
    }else if (isCrowdsalePhase2()){
      weiRaisedCs2 += weiAmount;
      deposits[sha3(beneficiary, 3)] += weiAmount;
    }else if (isCrowdsalePhase3()){
      weiRaisedCs3 += weiAmount;
      deposits[sha3(beneficiary, 4)] += weiAmount;
    }else if (isCrowdsalePhase4()){
      weiRaisedCs4 += weiAmount;
      deposits[sha3(beneficiary, 5)] += weiAmount;
    }

    // count backers
    totalBackers++;

    // Determine the current price
    updatePrices();

    // emit event for logging
    TokenDeposit(msg.sender, beneficiary, weiAmount);
  }

  //***************************************************
  //  Token distribution for presale purchasers
  //***************************************************
  function distributePresale(address beneficiary) {
    require(!halted);
    require(isCompleted());
    //require(deposits[beneficiary] > 0);
    require(beneficiary != 0x0);

    // amount investesd for each phase
    uint256 weiDepositCs0 = deposits[sha3(beneficiary, 1)];
    uint256 weiDepositCs1 = deposits[sha3(beneficiary, 2)];
    uint256 weiDepositCs2 = deposits[sha3(beneficiary, 3)];
    uint256 weiDepositCs3 = deposits[sha3(beneficiary, 4)];
    uint256 weiDepositCs4 = deposits[sha3(beneficiary, 5)];

    // prevent re-entrancy, clear out
    deposits[sha3(beneficiary, 1)] = 0;
    deposits[sha3(beneficiary, 2)] = 0;
    deposits[sha3(beneficiary, 3)] = 0;
    deposits[sha3(beneficiary, 4)] = 0;
    deposits[sha3(beneficiary, 5)] = 0;

    // tokens to give for each phase
    uint256 tokensCs0 = weiDepositCs0.mul(1 ether).div(crowdsaleTokenPrice0);
    uint256 tokensCs1 = weiDepositCs1.mul(1 ether).div(crowdsaleTokenPrice1);
    uint256 tokensCs2 = weiDepositCs2.mul(1 ether).div(crowdsaleTokenPrice2);
    uint256 tokensCs3 = weiDepositCs3.mul(1 ether).div(crowdsaleTokenPrice3);
    uint256 tokensCs4 = weiDepositCs4.mul(1 ether).div(crowdsaleTokenPrice4);

    // total tokens out to backer
    uint256 tokensOut = tokensCs0 + tokensCs1 + tokensCs2 + tokensCs3 + tokensCs4;

    // keep track of tokens out by phase
    crowdsaleTokenSent0 += tokensCs0;
    crowdsaleTokenSent1 += tokensCs1;
    crowdsaleTokenSent2 += tokensCs2;
    crowdsaleTokenSent3 += tokensCs3;
    crowdsaleTokenSent4 += tokensCs4;

    // transfer tokens
    modulayteToken.transfer(beneficiary, tokensOut);

    // emit event for logging
    TokenDistribution(msg.sender, beneficiary, tokensOut);
  }

  //***************************************************
  //  For deposits that do not come thru the contract
  //***************************************************
  function externalDeposit(address dep, uint256 amount) onlyOwner{
    require(isCompleted());

    uint256 tokensOut = amount.mul(1 ether).div(baseTokenPrice);

    //trackTokens(tokensOut, index);
    crowdsaleTokenSent4 += tokensOut;

    // Update raised
    weiRaisedCs4 = weiRaisedCs4.add(amount);

    // transfer tokens
    modulayteToken.transfer(dep, tokensOut);
  }

  //***************************************************
  //  Forward funds to refund vault
  //***************************************************
  function forwardFunds() internal {
    //wallet.transfer(msg.value);
    vault.deposit.value(msg.value)(msg.sender);
  }

  //***************************************************
  //  If crowdsale is unsuccessful, investors can claim refunds here
  //***************************************************
  function claimRefund() {
    require(!halted);
    require(finalized);
    require(!minimumGoalReached());
    vault.refund(msg.sender);
  }

  //***************************************************
  //  Finalize
  //***************************************************
  function finalize() onlyOwner {
    require(!finalized);
    require(isCompleted());

    finalized = true;

    if (minimumGoalReached()) {
      vault.close();
    } else {
      vault.enableRefunds();
    }
    Finalized();
  }

}
