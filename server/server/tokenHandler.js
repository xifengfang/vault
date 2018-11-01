const router = require('express').Router()
const bodyParser = require("body-parser");
const ab2str = require('arraybuffer-to-string');
const sendEmail = require('./sendEmail')
const Web3 = require('web3');
const voucher_codes = require('voucher-code-generator');
const mysql = require('promise-mysql');
const settings = require("./settings.internal");
const ethUtil = require('ethereumjs-util');
const zerorpc = require("zerorpc");
const utils = require("./utils");
const uuid = require('uuid');

router.use(bodyParser.json())


router.post('/getERC20Token', async (request, response) => {
    try{
        console.log("/getERC20Token");
      
      //TODO verify signature
      var conn = await getDBConn().getConnection();
      let result = await conn.query("SELECT * FROM ERC20Token");

      const tokenList = [];
      for(var i=0; i<result.length; i++)
      {
        tokenList.push({TokenTicker: result[i].TokenTicker, TokenName: result[i].TokenName, ContractAddr: result[i].ContractAddr});
      }
      console.log(tokenList);
      response.send({status: 'OK', tokenList: tokenList});

    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

var getDBConn = () => {
    var conn = mysql.createPool({
        host: settings.dbconnection.host,
        user: settings.dbconnection.user,
        password: settings.dbconnection.password,
        database: settings.dbconnection.database,
      });
    return conn;
}

module.exports = router