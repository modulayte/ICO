pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

//*****************************************************
// * @title ModToken
// * @dev  Initial supply is 1000000000
//   Supply is intended to be fixed
// ****************************************************
contract ModulayteToken is PausableToken {
  string public name = "MOD TOKEN - MODULAYTE";
  string public symbol = "MOD";
  uint256 public decimals = 18;
  uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18;

  /**
   * @dev Contructor that gives msg.sender all of existing tokens.
   */
  function ModulayteToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}
