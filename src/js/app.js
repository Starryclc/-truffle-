
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // 如果MetaMask已经提供了web3
      App.web3Provider = web3.currentProvider;
      ethereum.enable();
      web3 = new Web3(web3.currentProvider);
    } else {
      // 如果没有提供web3实例，指定默认实例
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');//与ganache的端口对应
      ethereum.enable();
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },


  initContract: function() {
    // 加载EContract.json，保存了ABI及部署后的地址信息
    $.getJSON("EContract.json", function(econtract) {
      // 初始化合约
      App.contracts.EContract = TruffleContract(econtract);
      // 连接与合约进行交互
      App.contracts.EContract.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },


    // 监听合约事件
    listenForEvents: function() {
      App.contracts.EContract.deployed().then(function(instance) {
  
      });
    },

  render: function() {
    // 获得账户登录地址和账户余额
    web3.eth.getCoinbase(function (err, account) {
      if (!err) {
        App.account = account;
        $("#accountAddress").html("当前登录账户地址: " + account);
        web3.eth.getBalance(account, function (err, res) {
          if (!err) {
            console.log(res);
            $("#accBalance").html("当前登录账户余额: " + res + 'wei');
          } else {
            console.log(err);
          }
        });
      }
    });


    App.contracts.EContract.deployed().then(function (instance) {
      econtractInstance = instance;
      console.log(instance);
      return econtractInstance.e_contractCount();
    }).then(function (e_contractCount) { //获取电子合约内容
      var e_contractInfo = $("#e_contractInfo");
      e_contractInfo.empty();
      var htt = Number(e_contractCount) + 1;
      $("#e_contractCount").html("当前合同序号为: " + htt);  //获取电子合约序号
      var acc = App.account;
      var count=0;
      for (var i = 1; i <= e_contractCount; i++) {
        econtractInstance.e_contracts(i).then(function (thisConInfo) {
          console.log(thisConInfo);
          var id = thisConInfo[0];
          var createTime = thisConInfo[1];
          var content = thisConInfo[2];
          var state1 = thisConInfo[3];
          var state2 = thisConInfo[4]
          var nickname1 = thisConInfo[5];
          var nickname2 = thisConInfo[6];
          var idCard1 = thisConInfo[7];
          var idCard2 = thisConInfo[8];
          var par1 = thisConInfo[9];
          var par2 = thisConInfo[10];

          if (state1 == 0 && state2==0) {
            var state = '新创建';
          } else if (state1 == 1 && state2==0 ) {
            var state = '甲方已签署等待乙方签署';
          }else if (state1==0&&state2==1){
            var state='乙方已签署等待甲方签署';
          } else if (state1 == 1&& state2==1) {
            var state = '已签署待确认';
          } else if (state1 == 2&&state2==1) {
            var state = '甲方已确认等待乙方确认';
          }else if(state1==1&&state2==2){
            var state = '乙方已确认等待甲方确认';
          }else if(state1==2&&state2==2){
            var state='已生效';
          }

          var unixTimestamp = new Date(createTime * 1000);
          var createTime = unixTimestamp.toLocaleString()
          var infoTemplate ="<table border='3' align='center' style='font-size: large'><tr><td align='left'>"
          + "当前合同状态：" + state + "</td></tr><tr><td align='left'>"
              + "合同序号：   " + id + "</td></tr><tr><td align='left'>"
              + "甲方姓名：   " + nickname1 +"</td></tr><tr><td align='left'>"
              + "乙方姓名：   " + nickname2 + "</td></tr> <tr><td align='left'>"
              + "甲方身份证号：" + idCard1 + "</td></tr> <tr><td align='left'>"
              + "乙方身份证号：" + idCard2 + "</td></tr> <tr><td align='left'>"
              + "甲方区块链地址：   " + par1 + "</td></tr> <tr><td align='left'>"
              + "乙方区块链地址：   " + par2 + "</td></tr> <tr><td align='left'>"
              + "合同创建时间：   " + createTime + "</td></tr> <tr><td align='left'>"
              + "合同内容：   " + content + "</td align='left'></tr> </table> "

          var qID = document.cookie.split(";")[0].split("=")[1]; //获得cookie中的qID
          if (id == qID) {
            e_contractInfo.append(infoTemplate);
          }


          if(par1==acc){
              $("#relative").append("<tr><td align='center'>" + id + "</td><td align='center'>" + state + "</td><td align='center'>" + "甲方" + "</td></tr>");
          }else if(par2==acc){
            $("#relative").append("<tr ><td align='center'>" + id + "</td><td align='center'>" + state + "</td><td align='center'>" + "乙方" + "</td></tr>");
          }

        });
      }
    })
  },

quaryC: function() {  //给修改cookie中qID代表合同序号
  qID= $('#qID').val();
  document.cookie="qID="+qID;
 },

 createC: function() {
  var nickname1= $('#nickname1').val();
  var nickname2= $('#nickname2').val();
  var idCard1= $('#idCard1').val();
  var idCard2= $('#idCard2').val();
  var con= $('#con').val();
  var par1= $('#par1').val();
  var par2= $('#par2').val();
  var userAccount = web3.eth.accounts[0];

  var reg = /^1[3|4|5|7|8][0-9]{9}$/;
  if((idCard1.length) != 18){
    alert('甲方身份证号码长度有误，请重新填写！');
    return false;
  }else if((idCard2.length)!=18){
    alert('乙方身份证号码长度有误，请重新填写！');
    return false;
  }else{
  App.contracts.EContract.deployed().then(function(instance) {
    return instance.createEcontract(con,nickname1,nickname2,idCard1,idCard2,par1,par2,{gas: 3000000, from: userAccount});
  }).then(function(result) {
    console.log(accounts[0]); 
  }).catch(function(err) {
    console.error(err);
  });
}},

//甲方签署
sign1: function() {
  var num1= $('#num1').val(); //获取合约序号
  var userAccount = web3.eth.accounts[0];

  App.contracts.EContract.deployed().then(function (instance) {
    return instance.sign1(num1, {gas: 3000000, from: userAccount});
  }).then(function(result) {
    console.log(accounts[0]); 
  }).catch(function(err) {
    console.error(err);
  });
},

sign2: function() {
  var num2= $('#num2').val();
  var userAccount = web3.eth.accounts[0];
  App.contracts.EContract.deployed().then(function(instance) {
    return instance.sign2(num2,{gas: 3000000, from: userAccount});
  }).then(function(result) {
    console.log(accounts[0]); 
  }).catch(function(err) {
    console.error(err);
  });
},

confirm1: function() {
  var confirm1= $('#confirm1').val();
  var userAccount = web3.eth.accounts[0];
  App.contracts.EContract.deployed().then(function(instance) {
    return instance.confirm1(confirm1,{gas: 3000000, from: userAccount});
  }).then(function(result) {
    // Wait for to update
    console.log(accounts[0]); 
  }).catch(function(err) {
    console.error(err);
  });
},

confirm2: function() {
  var confirm2= $('#confirm2').val();
  var userAccount = web3.eth.accounts[0];
  App.contracts.EContract.deployed().then(function(instance) {
    return instance.confirm2(confirm2,{gas: 3000000, from: userAccount});
  }).then(function(result) {
    // Wait for to update
    console.log(accounts[0]); 
  }).catch(function(err) {
    console.error(err);
  });
},
};


$(function() {
  $(window).load(function() {
    App.init();
  });
});