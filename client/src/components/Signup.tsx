import * as React from 'react';
import { css,StyleSheet } from 'aphrodite/no-important';
import TitleBar from './TitleBar';
import axios from 'axios';
const settings = require('../Vaultsetting');
const utils = require('../utils');

interface IState{
    wallet: string;
    error?: string;
    FirstName?: string;
    LastName?: string;
    ReferCode?: string;
    Email?: string;
}

// const decimalExpand = 1000000000000000000;

class Signup extends React.Component<{}, IState>{
    private web3: any;
    constructor(props: any) {
        super(props);
        this.state = {wallet: '', Email: utils.getQueryParameter("email"), ReferCode: utils.getQueryParameter("refercode")};
        this.web3 = (window as any).web3;
        // this.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/UQ4gSLQXTJohbznyC7PP'));
        // this.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/UQ4gSLQXTJohbznyC7PP'));
    }

    public componentWillMount() {
        // const web3Inst = this.web3;
        if(this.web3) { 
            this.web3.eth.getAccounts((err:any, accounts:any) => {
                if(accounts.length >0){
                    this.setState({wallet: accounts[0]});
                }
            })
        }
    }

    public render() {
        if(!this.state.wallet){
            return <div>Metamask is not connected, please connect Metamask first</div>
        }

        return(
             <div className={css(styles.paddingZero)+ " col-12"}>
                <TitleBar name="Signup" />
                <div className="container">
                    <div>Current Approver Address: {this.state.wallet} </div>
                    
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">First Name</label>
                            <input type="text" className="form-control" value={this.state.FirstName} onChange={this.updateFirstName} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">Last Name</label>
                            <input type="text" className="form-control" value={this.state.LastName} onChange={this.updateLastName} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Email Address</label>
                            <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={this.state.Email} onChange={this.updateEmail} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">Referral Code</label>
                            <input type="text" className="form-control" value={this.state.ReferCode} onChange={this.updateReferCode} />
                        </div>
                        {
                            this.state.error &&
                                <div className="alert alert-danger" role="alert">
                                    { this.state.error }
                                </div>
                        }
                        <button className="btn btn-primary" onClick={this.onSignup}>Sign Up</button>
                </div>
            </div>
        );
    }

    private updateFirstName = (e: any) => {
        this.setState({FirstName: e.target.value});
    }

    private updateLastName = (e: any) => {
        this.setState({LastName: e.target.value});
    }

    private updateEmail = (e: any) => {
        this.setState({Email: e.target.value});
    }

    private updateReferCode = (e: any) => {
        this.setState({ReferCode: e.target.value});
    }

    private onSignup = (e: any) => {
        (e as any).preventDefault();

        if(!this.state.FirstName){
            this.setState({error: 'First Name is empty'});
            return;
        }
        if(!this.state.LastName){
            this.setState({error: 'Last Name is empty'});
            return;
        }
        if(!this.state.Email){
            this.setState({error: 'Email is empty'});
            return;
        }

        const LastLoginTicker = new Date().getTime();
        const mm = 'Welcome to Vault. Please sign to login. ' + LastLoginTicker;
        const from = this.state.wallet;
        const msg = this.web3.toHex(mm);
        const params = [msg, from];
        const method = 'personal_sign';

        const self= this;
        this.web3.currentProvider.sendAsync({method,params,from},function (error: any, result: any){
            if(error) {
                self.setState({error: error});
                return;
            }
            if(result.error) {
                self.setState({error: result.error.message});
                return;
            }

            console.log(error); 
            console.log(result);
            const signature = result.result;
            
            const url = settings.apiUrl + '/user/signup';
            const data = {
                FirstName: self.state.FirstName,
                LastName: self.state.LastName,
                Email: self.state.Email,
                ReferCode: self.state.ReferCode,
                Message: mm,
                Signature: signature
            };
            axios.post(url, data, {
                headers: {
                  "content-Type": "application/json",
                }
              }
            )
              .then(function (response) {
                  console.log(response.data);
                  if(response.data.status == 'Error') {
                      self.setState({error: response.data.message});
                      console.log(self.state.wallet);
                  } else {
                    sessionStorage.setItem("token", response.data.token);
                    sessionStorage.setItem("firstName", data.FirstName||'');
                    sessionStorage.setItem("userId", response.data.userId);
                    (self.props as any).history.push('/');
                  }
              })
              .catch(function (error) {
                console.log(error);
              });

        })
    }
}

const styles = StyleSheet.create({
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
        marginLeft: '20px',
        marginTop: '20px'
    },
    textContent: {
        marginTop: '0px',
        marginLeft: '40px'
    },
    container1: {
        paddingLeft: '20px'
    }
})

export default Signup;