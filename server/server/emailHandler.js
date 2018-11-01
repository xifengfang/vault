const router = require('express').Router()
const bodyParser = require("body-parser")
const ab2str = require('arraybuffer-to-string')
const sendEmail = require('./sendEmail')
var mysql = require('mysql');
const settings = require("./settings.internal")

router.use(bodyParser.json())

router.post('/', (request, response) => {
    console.log('send email');
    try{
      const method = request.body.method
      const data = request.body.data
      console.log("Method: " +  method + ", data: " + data);

      var con = mysql.createConnection({
        host: settings.dbconnection.host,
        user: settings.dbconnection.user,
        password: settings.dbconnection.password,
        database: settings.dbconnection.database,
      });

      con.connect(function(err) {
        var dataAry = data.split('|');
        var myaddr = dataAry[0];
        var tx = dataAry[1];
        var ids = dataAry[2].split(',');
        var newIds = ids.length === 0 ? "" : "'" + ids.join("','") + "'";

        var approverList = [];
        if (err) {console.log(err); throw err; }
        con.query("SELECT * FROM UserInfo WHERE ApprovalAddress IN ("+ newIds + ")", function (err, result, fields) {
            if (err) throw err;
			
            for(var i=0; i<result.length; i++)
            {            
                var approver = {
                    FirstName: result[i].FirstName,
                    LastName: result[i].LastName,
                    Email: result[i].Email,
                    ApprovalAddress: result[i].ApprovalAddress,
                    AprpovalUrl: settings.system.host + '/signer.html?myaddr=' + myaddr + '&tx=' + tx + '&id=' + result[i].ApprovalAddress
                };
                approverList.push(approver);
            }
			console.log(approverList);

            con.query("SELECT * FROM Teller", function (err, result, fields) {
                if (err) throw err;
                for(var i=0; i<result.length; i++)
                {
                  var approver = {
                      FirstName: result[i].FirstName,
                      LastName: result[i].LastName,
                      Email: result[i].Email,
                      ApprovalAddress: result[i].ApprovalAddress,
                      IsTeller: true,
                      AprpovalUrl: settings.system.host + '/signer.html?myaddr=' + myaddr + '&tx=' + tx + '&id=' + result[i].ApprovalAddress,
                      SubmissionUrl: settings.system.host + '/tx.html?myaddr=' + myaddr + '&tx=' + tx
                  };
                  approverList.push(approver);

				console.log(approverList);
                  approverList.forEach(approver => {
                        var html = settings.transaction_approval_email.html;
                        var subject = settings.transaction_approval_email.subject;
                        var from = settings.transaction_approval_email.from;
                        if(approver.IsTeller)
                        {
                            html = settings.transaction_teller_email.html;
                            subject = settings.transaction_teller_email.subject;
                            from = settings.transaction_teller_email.from;
                        }
                        html = html.replace(/\{fname\}/gi, approver.FirstName).replace(/\{approveurl\}/gi, approver.AprpovalUrl).replace(/\{submissionurl\}/gi, approver.SubmissionUrl);

                        console.log(approver.Email);
                        sendEmail(from, approver.Email, subject, html);
                  });
                }
            });

        });

      });
      response.send({status: 'OK'});
    }
    catch(error){
        utility.handleError(request, response, error, 'internal_app_error')
    }
})

module.exports = router