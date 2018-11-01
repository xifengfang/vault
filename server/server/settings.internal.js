module.exports = {
    transaction_approval_email: {
        from: '',
        subject: '',
        html: '<div style="font-size: 16px"><p>Hi {fname} </p> <p>Please review and approve the transaction <a href="{approveurl}">Approve</a></p></div>'
    },

    transaction_teller_email: {
        from: '',
        subject: 'A transaction is waiting for approval',
        html: '<div style="font-size: 16px"><p>Hi {fname}</p> <p>Please review and approve the transaction <a href="{approveurl}">Approve</a></p><p>Please review the submission status <a href="{submissionurl}">Submission Status</a></p></div>'
    },

    invite_email: {
        from: '',
        subject: '',
        html: '<div style="font-size: 16px"><p>Hi</p> <p>Please visit our site to use Vault <a href="{signupurl}">Create Account</a></p></div>'       
    },
    walllet_email: {
        from: '',
        subject: 'Wallet creation request',
        html: '<div style="font-size: 16px"><p>Hi</p> <p>Please create wallet for the following approvers:<br /> {ApproverEmailList} <br /> WalletId: {WalletId}</p></div>'       
    },
    smtp: {
        host: '',
        port: '',
        user: '',
        pass: '',
        rootCertCheck: ''
    },
    system: {
        host: 'http://localhost:8082',
        port: 8082,
        portalHost: 'http://localhost:3000',
        supportEmail: '',
        rpcUrl: 'tcp://7.7.7.7:6655'
    },
    dbconnection: {
        host: "",
        user: "",
        password: "",
        database: "",
    },
}
