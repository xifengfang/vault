'use strict'
const fs = require('fs');
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const apiRouter = require("./server/apiRouter")
const https = require('https');
const http = require('http');
const emailHandler = require("./server/emailHandler");
const userHandler = require("./server/userHandler");
const tokenHandler = require("./server/tokenHandler");
const settings = require("./server/settings.internal");
var mysql = require('mysql');

const port = settings.system.port;
const web = express()


//TODO
function checkAuthTokenMiddleware(req, res, next) {
	console.log("Req Url: " + req.url);
	//return next();
	var needToken = !req.url.includes("/login") && !req.url.includes("/signup") && !req.url.includes("/rpc");
	if(!needToken) {
		return next();
	}
	console.log(needToken);
    if (req.headers && req.headers.authorization) {
        let token;
        const parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            const [scheme, credentials] = parts;

            if (/^Bearer$/i.test(scheme)) { // or any other scheme you are using
                token = credentials;
			}

			console.log("Token:" + token);

            if (token === undefined) {
				res.send(401);
				return;
			}

			var con = mysql.createConnection({
				host: settings.dbconnection.host,
				user: settings.dbconnection.user,
				password: settings.dbconnection.password,
				database: settings.dbconnection.database,
			  });
            con.query("SELECT * FROM OAuthAccessToken WHERE AccessToken = ?", [token], 
                function (err, result, fields) {
					if (err) throw err;
					var bExpired = result.length==0;

                    for(var i=0; i<result.length; i++)
                    {
						var expDate = new Date(result[i].DateExpiration);
						console.log(expDate);
						bExpired = expDate < new Date();
                        break;
					}
					if(bExpired){
						console.log("expired");
						res.send(401);
					}
					else {
						return next();
					}	
                }
            );
        }
    } else {
		res.redirect(settings.system.portalHost);
    }
}

// Certificate
const privateKey = fs.readFileSync(path.resolve(__dirname, './ssl/privatekey.pem'), 'utf8');
const certificate = fs.readFileSync(path.resolve(__dirname, './ssl/cert.pem'), 'utf8');
const ca = fs.readFileSync(path.resolve(__dirname, './ssl/chain.pem'), 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};


// Starting both http & https servers
const httpServer = http.createServer(web);
const httpsServer = https.createServer(credentials, web);

httpServer.listen(port, () => {
	console.log('HTTP Server running on port ' + port.toString());
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
  
web.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', '*');
	
	next();
});

web.post('/*', checkAuthTokenMiddleware, function(req, res, next) {
	console.log(req.url + ' in this');
	next();
});

//web.listen(port)
web.use(helmet())
web.use(express.static(path.resolve(__dirname, './public')))
web.use(morgan('short'))
web.use('/rpc', apiRouter)
web.use('/email', emailHandler)
web.use('/user', userHandler)
web.use('/token', tokenHandler)

// to support browser side routing
web.get('*', function (request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

console.log(`Portal is running at ${port}`)
