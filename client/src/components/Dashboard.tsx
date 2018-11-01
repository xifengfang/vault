import * as React from 'react';
import { css,StyleSheet } from 'aphrodite/no-important';
import TitleBar from './TitleBar';
import axios from 'axios';
const utils = require('../utils');
const setting = require('../Vaultsetting');

interface IWallet {
    Wallet: string,
    Alias: string
}

interface IERC20Token {
    TokenTicker?: string,
    TokenName?: string,
    ContractAddr?: string
}

interface IState {
    walletList: IWallet[],
    SelectedWallet?: string,
    error?: string,
    message?: string,
    balance?: string,
    RecipientAddress?: string,
    TransferAmount?: string,
    ERC20TokenList: IERC20Token[],
    SelectedToken: IERC20Token,
    TransactionUrl?: string
}

class Dashboard extends React.Component<{}, IState>{
    constructor(props:any) {
        super(props)
        this.state = {walletList:[], ERC20TokenList:[], SelectedToken:{}};
    }
    public componentDidMount()
    {
        const self = this;
        const url = setting.apiUrl + '/user/getwallet';
        const data = {
            token: sessionStorage.getItem("token")
        };
        axios.post(url, data, {
            headers: {
              "content-Type": "application/json",
              "Authorization": 'Bearer ' + sessionStorage.getItem('token')
            }
          }
        )
        .then(function (response) {
             console.log(response.data);
             if(response.data.status == 'Error') {
                 self.setState({error: response.data.message});
             } else {

                const wallet = response.data.walletList[0];
                const walletList = response.data.walletList;
                axios.post(setting.apiUrl + '/token/getERC20Token', data, {
                    headers: {
                      "content-Type": "application/json",
                      "Authorization": 'Bearer ' + sessionStorage.getItem('token')
                    }
                  }
                )
                .then(function (response) {
                     console.log(response.data);
                     const token = response.data.tokenList[0];
                     const tokenList = response.data.tokenList;
                     self.setState({walletList: walletList, SelectedWallet: wallet.Wallet, ERC20TokenList: tokenList, SelectedToken: token},
                                ()=>self.getAccountBalance());
                 })
                 .catch(function (error) {
                   console.log(error);
                });                 
             }
         })
         .catch(function (error) {
           console.log(error);
        });
    }
    
    public render(){
        return(
             <div className={css(styles.paddingZero)+ " col-12"}>
                <TitleBar name="DASHBOARD"/>
                <div style={height}>
                    <div>
                        <div className={css(styles.textLabel)}>Current Wallet</div>
                        <div className={css(styles.textContent)}>
                         {
                             this.state.walletList.length>0 &&
                             <div>
                             <select className={css(styles.selectCtrl)} value={this.state.SelectedWallet} onChange={this.onChangeWallet}>
                                 {
                                    this.state.walletList.map((wallet, index) =>
                                        <option key={index} value={wallet.Wallet}>{wallet.Alias + ' (' + wallet.Wallet + ')'}</option>)
                                 }
                             </select>
                             <select className={css(styles.selectCtrl)} value={this.state.SelectedToken.TokenTicker} onChange={this.onChangeToken}>
                                 {
                                    this.state.ERC20TokenList.map((token, index) =>
                                        <option key={index} value={token.TokenTicker}>{token.TokenName}</option>)
                                 }
                             </select>
                             </div>
                         }
                         {
                             this.state.balance &&
                             <div className={css(styles.balanceDiv)}>
                                 Balance {this.state.balance} {this.state.SelectedToken.TokenTicker}
                             </div>
                         }
                         {
                             this.state.SelectedWallet &&
                             <div className={css(styles.balanceDiv)}>
                                 You can check transactions at Etherscan <a href={this.state.TransactionUrl} target='_blank'>{this.state.TransactionUrl}</a>
                            </div>

                                
                         }
                         {
                             this.state.walletList.length>0 && 
                             <div className={css(styles.divTransfer)}>
                                <div className="form-group col-md-6">
                                    <label htmlFor="exampleInputEmail1">Recipient Address</label>
                                    <input type="text" className="form-control"  value={this.state.RecipientAddress} onChange={ this.updateRecipientAddress} />
                                </div>
                                <div className="form-group col-md-6">
                                    <label htmlFor="exampleInputEmail1">Amount</label>
                                    <input type="text" className="form-control"  value={this.state.TransferAmount} onChange={ this.updateTransferAmount} />
                                </div>
                                <button className={"btn btn-lg btn-primary " + css(styles.btn)} onClick={this.onTransferFund}>Transfer</button>
                            </div>
                         }
                         {
                             this.state.walletList.length==0 &&
                             <div>
                                 You have not setup any wallet yet.
                             </div>
                         }
                        {
                            this.state.error &&
                                <div className="alert alert-danger" role="alert">
                                    { this.state.error }
                                </div>
                        }
                        {
                            this.state.message &&
                                <div className="alert alert-success" role="alert">
                                    { this.state.message }
                                </div>
                        }
                        <div className={css(styles.noteDiv)}>
                            Your wallet private keys are secured within Vault hardware enclave.
                        </div>
                        <div className={css(styles.noteDiv)}>
                            <img src='https://Vault.pro/images/Vault_hardware.jpg' />
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private onChangeWallet = (e: any) => {
        const SelectedWallet = e.target.value;
        this.setState({SelectedWallet}, 
            ()=>this.getAccountBalance());
    }

    private onChangeToken = (e: any) => {
        const SelectedTokenTicker = e.target.value;
        for(let i=0; i<this.state.ERC20TokenList.length; i++)
        {
            if(this.state.ERC20TokenList[i].TokenTicker==SelectedTokenTicker) 
            {
                this.setState({SelectedToken: this.state.ERC20TokenList[i]}, 
                    ()=>this.getAccountBalance());
            }
        }
        
    }

    private getAccountBalance = () => {
        const fromAccount = this.state.SelectedWallet;
        const tokenTicker = this.state.SelectedToken.TokenTicker;
        const _Web3 = (window as any).Web3;
        const web3 = new _Web3(new _Web3.providers.HttpProvider(utils.web3_provider));
        const self = this;

        if(tokenTicker == "ETH")
        {
            web3.eth.getBalance(fromAccount,function(err: any, result:any){
                const amt = result.dividedBy(utils.decimal_expand).toString(10);
                self.setState({balance: amt});
            });
            this.setState({TransactionUrl: 'https://etherscan.io/address/'+ this.state.SelectedWallet})
        }
        else
        {
            utils.getERC20TokenBalance(this.state.SelectedToken.ContractAddr, fromAccount, (balance:any)=>{
                self.setState({balance: balance+''});
                console.log(this.state.SelectedToken.TokenName + ' balance:' + balance);
            });
            this.setState({TransactionUrl: 'https://etherscan.io/token/'+ this.state.SelectedToken.ContractAddr + '?a=' + this.state.SelectedWallet})
        }
    }

    private onTransferFund = (e: any) => {
        (e as any).preventDefault();
        if(!this.state.RecipientAddress){
            this.setState({error: 'Recipient is empty'});
            return;
        }
        if(!this.state.TransferAmount){
            this.setState({error: 'Transfer amount is empty'});
            return;
        }

        const amount = new Number((this.state.TransferAmount.trim() as any)* utils.decimal_expand).toLocaleString().replace(/,/g, "");

        //const amount = parseFloat(this.state.TransferAmount.trim()) * utils.decimal_expand;
        const toAddress = this.state.RecipientAddress;
        const fromAccount = this.state.SelectedWallet;

        const _Web3 = (window as any).Web3;
        const web3 = new _Web3(new _Web3.providers.HttpProvider(utils.web3_provider));

        const nonce = web3.toHex(web3.eth.getTransactionCount(fromAccount));
        console.log('from account nonce = ' + nonce);

        const tokenAddr = this.state.SelectedToken.ContractAddr;
        let txParams;
        if(this.state.SelectedToken.TokenTicker == "ETH")
        {
            txParams = {
                nonce: nonce, //web3.toHex(21),
                gasPrice: web3.toHex(5000000000), //web3.toHex(1000000000),
                gasLimit: web3.toHex(91000), //web3.toHex(210000), //'0x2710',
                from: fromAccount,
                to: toAddress,
                value: web3.toHex(amount),//'0x0', //web3.toHex(1000000000000000000),
                //data: data,
                // EIP 155 chainId - mainnet: 1, ropsten: 3, Rinkeby 4
                //chainId: '0x4'
                chainId: '0x1'
            };
        }
        else
        {
            txParams = {
                nonce: nonce, //web3.toHex(21),
                gasPrice: web3.toHex(5000000000), //web3.toHex(1000000000), 3
                gasLimit: web3.toHex(910000), //web3.toHex(210000), //'0x2710', 9w1
                from: fromAccount,
                to: tokenAddr,
                value: 0x00,//'0x0', //web3.toHex(1000000000000000000),
                data: utils.getERC20TransferData(tokenAddr, toAddress, amount),
                // EIP 155 chainId - mainnet: 1, ropsten: 3, Rinkeby 4
                chainId: '0x1'
            }
        }

        const tx = new (window as any).ethereumjs.Tx(txParams);
        const rlpEncoded = tx.hash(false, true);

        const rlpHex = rlpEncoded.toString('hex')
        console.log('rlphex = ' + rlpHex);

        const self = this;
        const data = {
            userId: sessionStorage.getItem("userId"),
            fromAccount: this.state.SelectedWallet,
            toAddress: this.state.RecipientAddress,
            amount: this.state.TransferAmount,
            data: tokenAddr + '|' + fromAccount + '|' + toAddress + '|' + amount + '|' + rlpHex + '|' + JSON.stringify(txParams),
        };
        axios.post(setting.apiUrl + '/rpc', JSON.stringify({method: 'get_signer_count', data: fromAccount+''}),
          {
            headers: {
              "content-Type": "application/json; charset=utf-8",
              "dataType": "json"
            }
          }
        )
        .then(function (response) {
             console.log(response.data);
             var ss = JSON.parse(response.data.result);
             ss = ss.map(function(el:any) {
                if(el.startsWith('0x'))
                    return el; 
                return '0x' + el; 
             });

             axios.post(setting.apiUrl + '/rpc', JSON.stringify({method: 'init_tx', data: data.data}),
             {
               headers: {
                 "content-Type": "application/json; charset=utf-8",
                 "dataType": "json"
               }
             })
             .then(function (response) {
                const txid = response.data.result;
                axios.post(setting.apiUrl + '/email', JSON.stringify({method: 'signer_sign_request', data: fromAccount + '|' + txid + '|' + ss.join(',')}),
                {
                    headers: {
                    "content-Type": "application/json; charset=utf-8",
                    "dataType": "json"
                    }
                })
                .then(function (response) {
                    self.setState({message: 'Approval instructions have been sent to approver email'});
                })
                .catch(function (error) {
                    console.log(error);
                });
             })
             .catch(function (error) {
                console.log(error);
             });
         })
         .catch(function (error) {
           console.log(error);
         });
    }

    private updateTransferAmount = (e: any) => {
        this.setState({TransferAmount: e.target.value});
    }

    private updateRecipientAddress = (e: any) => {
        this.setState({RecipientAddress: e.target.value});
    }
}

const styles = StyleSheet.create({
    btn: {
        cursor: 'pointer',
        marginLeft: '15px',
        marginTop: '10px',
    },
    paddingZero:{
        padding:"0px"
    },
    innerdiv :{
        backgroundColor: "#ffffff",
        padding: "14px 0px 1px 14px",
        marginTop: "12px",
        boxShadow: "0px 0px 5px darkgrey",
        backgroundSize: "123px",
        backgroundRepeat:"no-repeat",
        backgroundPosition: "right bottom"
    },
    textLabel: {
        marginLeft: '54px',
        marginTop: '20px',
        marginBottom: '10px'
    },
    balanceDiv: {
        marginLeft: '15px',
        marginTop: '5px'
    },
    selectCtrl: {
        marginLeft: '14px'
    },
    textContent: {
        marginTop: '0px',
        marginLeft: '40px'
    },
    container1: {
        paddingLeft: '20px'
    },
    inputElement: {
        width: '400px',
    },
    divTransfer: {
        marginTop: '20px',
    },
    noteDiv: {
        marginTop: '10px',
        marginLeft: '15px'
    }
})

const height = {
    height: window.innerHeight-100
}
export default Dashboard;