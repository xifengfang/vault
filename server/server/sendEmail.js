'use strict';
const nodemailer = require('nodemailer')
const promise = require("bluebird")
//const logger = require("./logger")
const settings = require("./settings.internal")


let transporter = nodemailer.createTransport({
    // service: "hotmail",
    host: settings.smtp.host,
    port: settings.smtp.port,
    auth: {
        user: settings.smtp.user,
        pass: settings.smtp.pass
    },
    secure: settings.smtp.port == 587? false : true,
    tls:  settings.smtp.port == 587?
        {
            ciphers: 'SSLv3',
            rejectUnauthorized: settings.rootCertCheck
        } : null
});


module.exports = (from, to, subject, html, delay = 0)=>{
    return new promise((resolve, reject)=>{
        // send mail with defined transport object
        let emailOptions = {
            to : to,
            from: from,
            subject: subject,
            html : html
        }

        setTimeout(()=>{
            console.log('send email to ' + to)
            transporter.sendMail(emailOptions, (error, info) => {
                if (error) {
                    reject(error)
                    //return logger.error(error);
                }
                //logger.info('Message %s sent: %s', info.messageId, info.response);
                resolve()
            });
        }, delay)
    })
}
