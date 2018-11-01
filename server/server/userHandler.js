const router = require('express').Router()
const bodyParser = require("body-parser");
const ab2str = require('arraybuffer-to-string');
const sendEmail = require('./sendEmail')
const Web3 = require('web3');
const voucher_codes = require('voucher-code-generator');
const mysql = require('mysql');
const settings = require("./settings.internal");
const ethUtil = require('ethereumjs-util');
const zerorpc = require("zerorpc");
const utils = require("./utils");
const uuid = require('uuid');

router.use(bodyParser.json())

router.post('/signup', (request, response) => {
    console.log("signup");
    try{
      //const ApprovalAddress = request.body.ApprovalAddress;
      const ReferCode = request.body.ReferCode;
      const FirstName = request.body.FirstName;
      const LastName = request.body.LastName;
      const Email = request.body.Email;
      //const LastLoginTicker = request.body.LastLoginTicker;
      const Message = request.body.Message;
      const Signature = request.body.Signature;

      const LastLoginTicker = Message.replace(/^\D+/g, '');
      console.log(LastLoginTicker);

      const sig = ethUtil.fromRpcSig(Signature);
      const prefix = new Buffer("\x19Ethereum Signed Message:\n");
      const prefixedMsg = ethUtil.sha3(
            Buffer.concat([prefix, new Buffer(String(Message.length)), ethUtil.toBuffer(Message)])
      );
      const publicKey  = ethUtil.ecrecover(prefixedMsg, sig.v, sig.r, sig.s);
      const addrBuf = ethUtil.pubToAddress(publicKey);
      const address = ethUtil.bufferToHex(addrBuf);
      
      const ApprovalAddress = address;


      console.log("Msg: " + Message);
      console.log("recovered address:" + address);

      var con = getDBConn();

      con.connect(function(err) {

        con.query("SELECT * FROM UserInfo WHERE ApprovalAddress = ? OR Email = ?", [ApprovalAddress, Email], function (err, result, fields) {
            if (err) throw err;

            let id = 0;
            for(var i=0; i<result.length; i++)
            {
                id = result[i].Id;
                const status = result[i].Status;
                if(status=='signup') {
                    response.send({status: 'Error', message: 'user already exist'});
                    return;
                }
                break;
            }

            if(id>0) {
                con.query("UPDATE UserInfo SET FirstName = ?, LastName = ?, Email = ?, ApprovalAddress = ?, LastLoginTicker = ?, Status = 'signup' WHERE Id = ?", 
                    [FirstName, LastName, Email, ApprovalAddress, LastLoginTicker, id], 
                    function (err, result, fields) {
                        if (err) throw err;
                        response.send({status: 'OK', message: 'user created successfully', userId: id});
                    }
                );
            }
            else {

                const ownReferCode = voucher_codes.generate()[0];
                con.query("SELECT * FROM SystemSetting", function(err, result, fields){
                    if (err) throw err;
                    for(var i=0; i<result.length; i++)
                    {
                        var version = result[i].Version;
                        if(version == 'beta'){
                            var code = result[i].MasterReferCode;
                            if(code != ReferCode)
                            {
                                response.send({status: 'Error', message: 'Invalid Coupon Code for Beta version'});
                                return;
                            }
                        }
                        break;
                    }

                    console.log("referralCode: " + ReferCode);
                    con.query("INSERT INTO UserInfo (FirstName, LastName, Email, ApprovalAddress, SignupCodeUsed, OwnReferCode, LastLoginTicker, Status) VALUES(?,?,?,?,?,?,?,'signup')", 
                        [FirstName, LastName, Email, ApprovalAddress, ReferCode, ownReferCode, LastLoginTicker], 
                        function (err, result, fields) {
                            if (err) throw err;
                            const newId = result.insertId;
                            console.log("newId: " + newId);
                            var expDate = new Date();
                            expDate.setHours(expDate.getHours() + 24);
                            const token= uuid.v4().replace(/-/g,"");
                            con.query("INSERT INTO OAuthAccessToken (UserId, AccessToken, DateExpiration) VALUES (?,?,?)", 
                                [newId, token, expDate], 
                                function (err, result, fields) {
                                    if (err) throw err;
                                    response.send({status: 'OK', message: 'user created successfully', userId: newId, token: token});
                            });
                    });
                })
            }
        });
      });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

router.post('/login', (request, response) => {
    try{
        console.log("/Login");
      //const LastLoginTicker = request.body.LastLoginTicker;
      const Message = request.body.Message;
      const Signature = request.body.Signature;

      const LastLoginTicker = Message.replace(/^\D+/g, '');

      const sig = ethUtil.fromRpcSig(Signature);
      const prefix = new Buffer("\x19Ethereum Signed Message:\n");
      const prefixedMsg = ethUtil.sha3(
            Buffer.concat([prefix, new Buffer(String(Message.length)), ethUtil.toBuffer(Message)])
      );
      const publicKey  = ethUtil.ecrecover(prefixedMsg, sig.v, sig.r, sig.s);
      const addrBuf = ethUtil.pubToAddress(publicKey);
      const address = ethUtil.bufferToHex(addrBuf);
      
      const ApprovalAddress = address;

      console.log("wallet: " +  ApprovalAddress + ", signature: " + Signature);
      
      
      var con = getDBConn();

      con.connect(function(err) {

        con.query("SELECT * FROM UserInfo WHERE ApprovalAddress = ?", [ApprovalAddress], function (err, result, fields) {
            if (err) throw err;

            console.log("ApproverWallet: " + ApprovalAddress);

            if(result.length==0)
            {
                response.send({status: 'Error', message: 'user does not exist'});
                return;               
            }

            var ret = {};
            let userId = 0;
            for(var i=0; i<result.length; i++)
            {
                userId = result[i].Id;
                ret = {FirstName: result[i].FirstName, LasttName: result[i].LastName, Email: result[i].Email, UserId: result[i].Id};
                break;
            }
            con.query("UPDATE UserInfo SET LastLoginTicker = ? WHERE ApprovalAddress = ?", [LastLoginTicker, ApprovalAddress], function (err, result, fields) {
                if (err) throw err;

                var expDate = new Date();
                expDate.setHours(expDate.getHours() + 24);
                const token= uuid.v4().replace(/-/g,"");
                con.query("INSERT INTO OAuthAccessToken (UserId, AccessToken, DateExpiration) VALUES (?,?,?)", 
                    [userId, token, expDate], 
                    function (err, result, fields) {
                        if (err) throw err;
                        response.send({status: 'OK', message: 'user login successfully', userId: userId, firstName: ret.FirstName, token: token});
                        return;
                    }
                );
            });
        });
      });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

router.post('/invite', (request, response) => {
    try{
        console.log("/invite");
      const Signature = request.body.Signature;
      const ApprovalAddress = request.body.ApprovalAddress;
      const InviteeEmail = request.body.InviteeEmail;
      const InviterId = request.body.InviterId;

      console.log("wallet: " +  ApprovalAddress + ", signature: " + Signature);
      
      //TODO verify signature
      
      var con = getDBConn();

      con.connect(function(err) {

        con.query("SELECT * FROM UserInfo WHERE Email = ?", [InviteeEmail], function (err, result, fields) {
            if (err) throw err;
            if(result.length>0) {
                response.send({status: 'Error', message: 'user was already invited'});
                return;
            }
            con.query("SELECT * FROM UserInfo WHERE Id = ?", [InviterId], 
                function (err, result, fields) {
                    if (err) throw err;
                    let referCode = "";
                    for(var i=0; i<result.length; i++)
                    {
                        referCode = result[i].OwnReferCode;
                        break;
                    }
                    const signupUrl = settings.system.portalHost + "/signup?email=" + InviteeEmail + "&refercode=" + referCode;
                    var html = settings.invite_email.html;
                    var subject = settings.invite_email.subject;
                    var from = settings.invite_email.from;
                    html = html.replace(/\{signupurl\}/gi, signupUrl);

                    sendEmail(from, InviteeEmail, subject, html);
                    response.send({status: 'OK', message: 'invitation has been sent to user'});
                }
            );
        });
      });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

router.post('/getdetail', (request, response) => {
    try{
        console.log("/getdetail");
      const userId = request.body.userId;
      const email = request.body.email;
      console.log("userId: " +  userId);
      
      //TODO verify signature
      
      var con = getDBConn();

      con.connect(function(err) {
        let query = "SELECT * FROM UserInfo WHERE Email = ?";
        let id = email;
        if(userId) {
            query = "SELECT * FROM UserInfo WHERE Id = ?";
            id = userId;
        }
        con.query(query, [id], function (err, result, fields) {
            if (err) throw err;
            if(result.length==0)
            {
                response.send({status: 'Error', message: 'user does not exist'});
                return;
            }

            for(var i=0; i<result.length; i++)
            {
                if(!result[i].ApprovalAddress) {
                    response.send({status: 'Error', message: 'user does not signup it'});
                    return;
                }

                const address = result[i].ApprovalAddress.substring(0,6) + '***************************';
                response.send({FirstName: result[i].FirstName, LastName: result[i].LastName, Email: result[i].Email, UserId: result[i].Id, ApprovalAddress: address});
                return;
            }
        });
      });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

router.post('/getwallet', (request, response) => {
    try{
        console.log("/getwallet");
      const token = request.body.token;
      console.log("token: " +  token);
      
      //TODO verify signature
      
      var con = getDBConn();

      con.connect(function(err) {
        con.query("SELECT * FROM OAuthAccessToken WHERE AccessToken = ?", [token], function (err, result, fields) {
            if (err) throw err;
            if(result.length==0)
            {
                response.send({status: 'Error', message: 'user is not authenticated'});
                return;
            }
            let userId = 0;
            for(var i=0; i<result.length; i++)
            {
                userId = result[i].UserId;
                break;
            }
            console.log("userId: " + userId);

            con.query("SELECT * FROM WalletApprover join Wallet WHERE UserId = ? AND WalletApprover.WalletId = Wallet.Id AND Status <> 'pending'", [userId], function (err, result, fields) {
                if (err) throw err;
                if(result.length==0)
                {
                    response.send({status: 'Error', message: 'user does not setup any wallet yet'});
                    return;
                }
    
                const walletList = [];
                for(var i=0; i<result.length; i++)
                {
                    walletList.push({Wallet: result[i].Wallet, Alias: result[i].Alias});
                }
                response.send({status: 'OK', walletList: walletList});
                return;
            });
        });
      });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

router.post('/createwallet', (request, response) => {
    try{
        console.log("/createwallet");
      const WalletType = request.body.WalletType;
      const EmailList = request.body.EmailList.split(",");
      const Alias = request.body.Alias;
      console.log("EmailList: " +  EmailList);
      console.log("Alias: " +  Alias);
      
      //TODO verify signature
      var con = getDBConn();

      let newEmailList = EmailList.length === 0 ? "" : "'" + EmailList.join("','") + "'";
      let userIdList = [];
      con.connect(function(err) {
        con.query("SELECT * FROM UserInfo WHERE Email IN (" + newEmailList + ")", function (err, result, fields) {
            if (err) throw err;
            if(result.length==0)
            {
                response.send({status: 'Error', message: 'user does not exist'});
                return;
            }

            try{

                const addressList = [];
                for(var i=0; i<result.length; i++)
                {
                    userIdList.push(result[i].Id);
                    addressList.push(result[i].ApprovalAddress);
                }

                const Wallet = "0x00000000000000000000000";
                con.query("INSERT INTO Wallet (Wallet,WalletType,Status,Alias) VALUES(?,?,'pending',?)", [Wallet, WalletType, Alias],  function (err, result, fields) {
                    if(err) throw err;

                    for(var i=0; i<userIdList.length; i++)
                    {
                        con.query("INSERT INTO WalletApprover (UserId, WalletId) VALUES(?,?)", [userIdList[i], result.insertId],  function (err, result, fields) {});                            
                    }

                    var from = settings.walllet_email.from;
                    var html = settings.walllet_email.html.replace(/\{ApproverEmailList\}/gi, EmailList.join(",")).replace(/\{WalletId\}/gi, result.insertId);

                    sendEmail(settings.walllet_email.from, settings.system.supportEmail, settings.walllet_email.subject, html);

                    response.send({status: "OK", message: "wallet creation is pending"});
                });

              }
              catch(error){
                  utility.handleError(request, response, error, 'internal_app_error')
              }
        });
      });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

router.post('/logout', (request, response) => {
    try{
        console.log("/logout");
      const token = request.body.token;
      console.log("token: " +  token);
      
      //TODO verify signature
      var con = getDBConn();

      con.connect(function(err) {

        var expDate = new Date();
        expDate.setMinutes(expDate.getMinutes() - 1);
        con.query("Update OAuthAccessToken SET DateExpiration = ? WHERE AccessToken = ?", 
            [expDate, token], 
            function (err, result, fields) {
                if (err) throw err;
                console.log("log user out:");
                response.send({status: 'OK', message: 'user signout successfully'});
        });
      });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

router.post('/transferfund', (request, response) => {
    try{
        var data = request.body.data;
        var fromAccount = request.body.fromAccount;
        var toAddress = request.body.toAddress;
        var amount = request.body.amount;

        var client = new zerorpc.Client();
        client.connect(settings.system.rpcUrl);
        
        client.on("error", function(error) {
            console.error("RPC client error:", error);
        });
        
        client.invoke("get_signer_count", fromAccount, function(error, result, more) {
            if(error) {
                console.error(error.message);
                response.send({error: error.message})
                return;
            } else {
                client.invoke("init_tx", data, function(error, result, more) {
                    if(error) {
                        console.error(error.message);
                        response.send({error: error.message})
                        return;
                    } else {
                        var result = ab2str(result);
                        var txid = result.result;
                    }
                
                    if(!more) {
                        console.log("Done.");
                    }
                });
            }
        
            if(!more) {
                console.log("Done.");
            }
        });
    }
    catch(error){
        console.log(error + 'internal_app_error');
        throw error;
    }
})

var getDBConn = () => {
    var conn = mysql.createConnection({
        host: settings.dbconnection.host,
        user: settings.dbconnection.user,
        password: settings.dbconnection.password,
        database: settings.dbconnection.database,
      });
    return conn;
}

module.exports = router