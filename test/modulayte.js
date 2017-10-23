//var MetaCoin = artifacts.require("./BoomrCoin.sol");
var Crowdsale = artifacts.require("./ModulayteCrowdsale.sol");

contract('Crowdsale', function(accounts) {

    var moment = require('moment');

    function waitForTimeStamp(waitForTimeStamp) {
        var currentTimeStamp = moment().utc().unix();
        var wait =  waitForTimeStamp - currentTimeStamp;
        wait = wait < 0 ? 0 : wait;
        console.log("    ... waiting ", wait, "seconds...");

        return new Promise( resolve => {
                setTimeout(function () {
                    var blockTimeStamp = web3.eth.getBlock( web3.eth.blockNumber).timestamp;
                    if( blockTimeStamp < waitForTimeStamp ) {
                        web3.eth.sendTransaction({from: web3.eth.accounts[0]}, function(error, res) {
                            if (error) {
                                console.log("waitForTimeStamp() web3.eth.sendTransaction() error")
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                }, wait * 1000);
        });

    } // waitForTimeStamp()

  ///////////////////////////////////////////////////////////////////////
  //  Presale wait phase
  ///////////////////////////////////////////////////////////////////////

  it("should have phases", function() {
    console.log("    ********************************************");
    console.log("    PHASE - Waiting to start");
    console.log("    ********************************************");
    var liblob;
    console.log("    Phases: ");
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Phase Wait: " + v[0]);
      console.log("    Phase Crowdsale Phase0: " + v[1]);
      console.log("    Phase Crowdsale Phase1: " + v[2]);
      console.log("    Phase Crowdsale Phase2: " + v[3]);
      console.log("    Phase Crowdsale Phase3: " + v[4]);
      console.log("    Phase Crowdsale Phase4: " + v[5]);
      console.log("    Phase Crowdsale completed: " + v[8]);
    });
  });

  it("should have a token", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.modulayteToken.call();
    }).then(function(token) {
      console.log("    Found token " + token);
    });
  });

  it("should have a token balance", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentStateSales.call();
    }).then(function(v) {
      console.log("    Found balance " + v[10] / 1000000000000000000);
      assert.equal(v[10] / 1000000000000000000, 300000000, "300000000 wasn't in the first account");

    });
  });

  it("should wait until duration has passed", () => {
       return Crowdsale.deployed().then( res => {
           var waitLength = 30; // in seconds
           var waitUntil = moment().utc().unix() + waitLength;
           return waitForTimeStamp(waitUntil);
       }).then( res => {
           //done();
       });
   });

  ///////////////////////////////////////////////////////////////////////
  //  Presale
  ///////////////////////////////////////////////////////////////////////

  it("should have phases", function() {
    console.log("    ********************************************");
    console.log("    PHASE - Presale");
    console.log("    ********************************************");
    var liblob;
    console.log("    Phases: ");
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Phase Wait: " + v[0]);
      console.log("    Phase Crowdsale Phase0: " + v[1]);
      console.log("    Phase Crowdsale Phase1: " + v[2]);
      console.log("    Phase Crowdsale Phase2: " + v[3]);
      console.log("    Phase Crowdsale Phase3: " + v[4]);
      console.log("    Phase Crowdsale Phase4: " + v[5]);
      console.log("    Phase Crowdsale completed: " + v[8]);
    });
  });

  it("should take a presale deposits from 5 people...", function() {
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.sendTransaction({value: 2000000000000000000, from: accounts[1]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 2000000000000000000, from: accounts[2]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 2000000000000000000, from: accounts[3]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 2000000000000000000, from: accounts[4]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 2000000000000000000, from: accounts[5]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    });
  });

it("should have deposit totals", function() {
  return Crowdsale.deployed().then(function(instance) {
    return instance.phaseDeposits.call();
  }).then(function(v) {
    console.log("    CS0 deposit:     " + v[0]);
    console.log("    CS1 deposit:     " + v[1]);
    console.log("    CS2 deposit:     " + v[2]);
    console.log("    CS3 deposit:     " + v[3]);
    console.log("    CS4 deposit:     " + v[4]);

  });
});

  it("should FAIL to distribute presale deposits early...", function() {
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.distributePresale(accounts[1], {from: accounts[1]});
    }).then(assert.fail).catch(function(error) {
      console.log("    ->" + error.message);
      assert(error.message.indexOf('invalid opcode') >= 0, 'Expected throw, but got: ' + error);
    });
  });

  it("should have a prices...", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentStateSales.call();
    }).then(function(v) {
      console.log("    Base Price:    " + v[0]);
      console.log("    CS0 Price:     " + v[1]);
      console.log("    CS1 Price:     " + v[2]);
      console.log("    CS2 Price:     " + v[3]);
      console.log("    CS3 Price:     " + v[4]);
      console.log("    CS4 Price:     " + v[5]);
    });
  });

  it("should wait until duration has passed", () => {
       return Crowdsale.deployed().then( res => {
           var waitLength = 30; // in seconds
           var waitUntil = moment().utc().unix() + waitLength;
           return waitForTimeStamp(waitUntil);
       }).then( res => {
           //done();
       });
   });

   ///////////////////////////////////////////////////////////////////////
   //  crowdsale phase 1
   ///////////////////////////////////////////////////////////////////////

  it("should have phases", function() {
    console.log("    ********************************************");
    console.log("    PHASE - Crowdsale 1");
    console.log("    ********************************************");
    var liblob;
    console.log("    Phases: ");
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Phase Wait: " + v[0]);
      console.log("    Phase Crowdsale Phase0: " + v[1]);
      console.log("    Phase Crowdsale Phase1: " + v[2]);
      console.log("    Phase Crowdsale Phase2: " + v[3]);
      console.log("    Phase Crowdsale Phase3: " + v[4]);
      console.log("    Phase Crowdsale Phase4: " + v[5]);
      console.log("    Phase Crowdsale completed: " + v[8]);
    });
  });

  it("should take a purchases from 2 people...", function() {
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[6]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[7]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    });
  });

  it("should have deposit totals", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.phaseDeposits.call();
    }).then(function(v) {
      console.log("    CS0 deposit:     " + v[0]);
      console.log("    CS1 deposit:     " + v[1]);
      console.log("    CS2 deposit:     " + v[2]);
      console.log("    CS3 deposit:     " + v[3]);
      console.log("    CS4 deposit:     " + v[4]);
    });
  });

  it("should have a prices...", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentStateSales.call();
    }).then(function(v) {
      console.log("    Base Price:    " + v[0]);
      console.log("    CS0 Price:     " + v[1]);
      console.log("    CS1 Price:     " + v[2]);
      console.log("    CS2 Price:     " + v[3]);
      console.log("    CS3 Price:     " + v[4]);
      console.log("    CS4 Price:     " + v[5]);
    });
  });

  it("should wait until duration has passed", () => {
       return Crowdsale.deployed().then( res => {
           var waitLength = 30; // in seconds
           var waitUntil = moment().utc().unix() + waitLength;
           return waitForTimeStamp(waitUntil);
       }).then( res => {
           //done();
       });
   });

   ///////////////////////////////////////////////////////////////////////
   //  crowdsale phase 2
   ///////////////////////////////////////////////////////////////////////

  it("should have phases", function() {
    console.log("    ********************************************");
    console.log("    PHASE - Crowdsale 2");
    console.log("    ********************************************");
    var liblob;
    console.log("    Phases: ");
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Phase Wait: " + v[0]);
      console.log("    Phase Crowdsale Phase0: " + v[1]);
      console.log("    Phase Crowdsale Phase1: " + v[2]);
      console.log("    Phase Crowdsale Phase2: " + v[3]);
      console.log("    Phase Crowdsale Phase3: " + v[4]);
      console.log("    Phase Crowdsale Phase4: " + v[5]);
      console.log("    Phase Crowdsale completed: " + v[8]);
    });
  });

  it("should take a purchases from 2 people...", function() {
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[8]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[9]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    });
  });

  it("should have deposit totals", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.phaseDeposits.call();
    }).then(function(v) {
      console.log("    CS0 deposit:     " + v[0]);
      console.log("    CS1 deposit:     " + v[1]);
      console.log("    CS2 deposit:     " + v[2]);
      console.log("    CS3 deposit:     " + v[3]);
      console.log("    CS4 deposit:     " + v[4]);
    });
  });

  it("should have a prices...", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentStateSales.call();
    }).then(function(v) {
      console.log("    Base Price:    " + v[0]);
      console.log("    CS0 Price:     " + v[1]);
      console.log("    CS1 Price:     " + v[2]);
      console.log("    CS2 Price:     " + v[3]);
      console.log("    CS3 Price:     " + v[4]);
      console.log("    CS4 Price:     " + v[5]);
    });
  });

  it("should wait until duration has passed", () => {
       return Crowdsale.deployed().then( res => {
           var waitLength = 30; // in seconds
           var waitUntil = moment().utc().unix() + waitLength;
           return waitForTimeStamp(waitUntil);
       }).then( res => {
           //done();
       });
   });

   ///////////////////////////////////////////////////////////////////////
   //  crowdsale phase 3
   ///////////////////////////////////////////////////////////////////////

  it("should have phases", function() {
    console.log("    ********************************************");
    console.log("    PHASE - Crowdsale 3");
    console.log("    ********************************************");
    var liblob;
    console.log("    Phases: ");
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Phase Wait: " + v[0]);
      console.log("    Phase Crowdsale Phase0: " + v[1]);
      console.log("    Phase Crowdsale Phase1: " + v[2]);
      console.log("    Phase Crowdsale Phase2: " + v[3]);
      console.log("    Phase Crowdsale Phase3: " + v[4]);
      console.log("    Phase Crowdsale Phase4: " + v[5]);
      console.log("    Phase Crowdsale completed: " + v[8]);
    });
  });

  it("should take a purchases from 2 people...", function() {
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[8]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[9]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    });
  });

  it("should have deposit totals", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.phaseDeposits.call();
    }).then(function(v) {
      console.log("    CS0 deposit:     " + v[0]);
      console.log("    CS1 deposit:     " + v[1]);
      console.log("    CS2 deposit:     " + v[2]);
      console.log("    CS3 deposit:     " + v[3]);
      console.log("    CS4 deposit:     " + v[4]);
    });
  });

  it("should have a prices...", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentStateSales.call();
    }).then(function(v) {
      console.log("    Base Price:    " + v[0]);
      console.log("    CS0 Price:     " + v[1]);
      console.log("    CS1 Price:     " + v[2]);
      console.log("    CS2 Price:     " + v[3]);
      console.log("    CS3 Price:     " + v[4]);
      console.log("    CS4 Price:     " + v[5]);
    });
  });

  it("should wait until duration has passed", () => {
       return Crowdsale.deployed().then( res => {
           var waitLength = 30; // in seconds
           var waitUntil = moment().utc().unix() + waitLength;
           return waitForTimeStamp(waitUntil);
       }).then( res => {
           //done();
       });
   });

   ///////////////////////////////////////////////////////////////////////
   //  crowdsale phase 4
   ///////////////////////////////////////////////////////////////////////

  it("should have phases", function() {
    console.log("    ********************************************");
    console.log("    PHASE - Crowdsale 4");
    console.log("    ********************************************");
    var liblob;
    console.log("    Phases: ");
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Phase Wait: " + v[0]);
      console.log("    Phase Crowdsale Phase0: " + v[1]);
      console.log("    Phase Crowdsale Phase1: " + v[2]);
      console.log("    Phase Crowdsale Phase2: " + v[3]);
      console.log("    Phase Crowdsale Phase3: " + v[4]);
      console.log("    Phase Crowdsale Phase4: " + v[5]);
      console.log("    Phase Crowdsale completed: " + v[8]);
    });
  });

  it("should take a purchases from 2 people...", function() {
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[6]});
    }).then(function(result) {
      //assert.equal(HiddenNum, numfive, numfive + " wasn't the fist number - was " + HiddenNum);
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[7]});
    }).then(function(result) {
      //assert.equal(HiddenNum, numfive, numfive + " wasn't the fist number - was " + HiddenNum);
      console.log("    " + result.logs[0].event);
    });
  });

  it("should have deposit totals", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.phaseDeposits.call();
    }).then(function(v) {
      console.log("    CS0 deposit:     " + v[0]);
      console.log("    CS1 deposit:     " + v[1]);
      console.log("    CS2 deposit:     " + v[2]);
      console.log("    CS3 deposit:     " + v[3]);
      console.log("    CS4 deposit:     " + v[4]);
    });
  });

  it("should have a prices...", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentStateSales.call();
    }).then(function(v) {
      console.log("    Base Price:    " + v[0]);
      console.log("    CS0 Price:     " + v[1]);
      console.log("    CS1 Price:     " + v[2]);
      console.log("    CS2 Price:     " + v[3]);
      console.log("    CS3 Price:     " + v[4]);
      console.log("    CS4 Price:     " + v[5]);
    });
  });

  it("should wait until duration has passed", () => {
       return Crowdsale.deployed().then( res => {
           var waitLength = 30; // in seconds
           var waitUntil = moment().utc().unix() + waitLength;
           return waitForTimeStamp(waitUntil);
       }).then( res => {
           //done();
       });
   });

  ///////////////////////////////////////////////////////////////////////
  //  distribution
  ///////////////////////////////////////////////////////////////////////

  it("should distribute presale deposits from 5 people...", function() {
    console.log("    ********************************************");
    console.log("    PHASE - Distribution");
    console.log("    ********************************************");
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.distributePresale(accounts[1], {from: accounts[1]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[2], {from: accounts[2]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[3], {from: accounts[3]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[4], {from: accounts[4]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[5], {from: accounts[5]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[6], {from: accounts[6]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[7], {from: accounts[7]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[8], {from: accounts[8]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    }).then(function() {
      return crowdsale.distributePresale(accounts[9], {from: accounts[9]});
    }).then(function(result) {
      console.log("    " + result.logs[0].event);
    });
  });

    it("should have a token sold count", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentTokenDistribution.call();
    }).then(function(v) {
      console.log("    Presale Tokens Sold:   " + v[0]);
      console.log("    CS1 Tokens Sold:       " + v[1]);
      console.log("    CS2 Tokens Sold:       " + v[2]);
      console.log("    CS3 Tokens Sold:       " + v[3]);
      console.log("    CS4 Tokens Sold:       " + v[4]);
    });
  });

  it("should have deposit totals", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.phaseDeposits.call();
    }).then(function(v) {
      console.log("    CS0 deposit:     " + v[0]);
      console.log("    CS1 deposit:     " + v[1]);
      console.log("    CS2 deposit:     " + v[2]);
      console.log("    CS3 deposit:     " + v[3]);
      console.log("    CS4 deposit:     " + v[4]);
    });
  });

  it("should have a token balance", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.currentStateSales.call();
    }).then(function(v) {
      console.log("    Found balance " + v[10] / 1000000000000000000);
      assert.equal(v[10] / 1000000000000000000, 0, "0 wasn't in the first account");
    });
  });

  it("should have phases", function() {
    var liblob;
    console.log("    Phases: ");
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Phase Wait: " + v[0]);
      console.log("    Phase Crowdsale Phase0: " + v[1]);
      console.log("    Phase Crowdsale Phase1: " + v[2]);
      console.log("    Phase Crowdsale Phase2: " + v[3]);
      console.log("    Phase Crowdsale Phase3: " + v[4]);
      console.log("    Phase Crowdsale Phase4: " + v[5]);
      console.log("    Phase Crowdsale completed: " + v[8]);
    });
  });

  it("should FAIL to purchase...", function() {
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.sendTransaction({value: 1000000000000000000, from: accounts[1]});
    }).then(assert.fail).catch(function(error) {
      console.log("    ->" + error.message);
      assert(error.message.indexOf('invalid opcode') >= 0, 'Expected throw, but got: ' + error);
    });
  });

   it("should be under goal.", function() {
    var liblob;
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      console.log("    Goal Reached: " + v[7]);
    });
  });

  it("should fail refund...", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.claimRefund({from: accounts[1]});
    }).then(assert.fail).catch(function(error) {
      console.log("    ->" + error.message);
      assert(error.message.indexOf('invalid opcode') >= 0, 'Expected throw, but got: ' + error);
    });
  });

   it("should not be finalized...", function() {
    var liblob;
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      assert(v[9] == false, "Finalized was true too early");
      console.log("    Finalized: " + v[9]);
    });
  });

  it("should finalize...", function() {
    return Crowdsale.deployed().then(function(instance) {
      return instance.finalize({from: accounts[0]});
    }).then(function(result) {
      console.log("    Finalized: " + result.logs[0].event);
    });
  });

  it("should be finalized...", function() {
    var liblob;
    return Crowdsale.deployed().then(function(instance) {
      liblob = instance;
      return liblob.currentStateActive.call();
    }).then(function(v) {
      assert(v[9] == true, "Finalized was FALSE too late!!");
      console.log("    Finalized: " + v[9]);
    });
  });

  it("should distribute presale deposits from 5 people...", function() {
    console.log("    ********************************************");
    console.log("    Refunds");
    console.log("    ********************************************");
    var crowdsale;
    return Crowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return crowdsale.claimRefund({from: accounts[1]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[2]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[3]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[4]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[5]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[6]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[7]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[8]});
    }).then(function(result) {
      console.log("    " + result);
    }).then(function() {
      return crowdsale.claimRefund({from: accounts[9]});
    }).then(function(result) {
      console.log("    " + result);
    });
  });

});
