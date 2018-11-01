import * as React from 'react';
import TitleBar from './TitleBar';
import {css,StyleSheet } from 'aphrodite/no-important';
const setting = require('../Vaultsetting');
import axios from 'axios';
import { Link } from 'react-router-dom';

interface IUser {
    Wallet: string;
    Email: string;
}
interface IState {
    AddedApproverList: IUser[],
    CrntApprover: string,
    Error?: string,
    OtherError?: string;
    Alias?: string;
    WalletError?: string,
    VaultWallet?: string
}

export class CreateWallet extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            AddedApproverList: [],
            CrntApprover: ""
        }
    }

    public render() { 
        return (
            <div>
                <TitleBar name="Create Wallet"/>
                <div className={css(styles.frientList)}>
                    {
                        this.state.AddedApproverList.length>0 &&
                            <div className={css(styles.textLabel)}>Approver List</div>
                    }
                    {
                        this.state.AddedApproverList.map((approver, index) =>
                            <div key={index} className="row">
                                <div className="col-md-12">
                                    <div className={css(styles.formElement)}>Approver {index+1}:</div> 
                                    <div className={css(styles.formElement)}>{approver.Email} ({approver.Wallet})</div>
                                </div>
                            </div>
                        )
                    }
                    <div className="row col-md-12">
                        <div className={css(styles.formElement1)}>
                            Email:
                        </div>
                        <div>
                            <input type="text" className={css(styles.inputElement)} value={this.state.CrntApprover} onChange={ this.updateEmail} />
                        </div>
                    </div>

                {
                    this.state.AddedApproverList.length>0 &&
                        <div className={"row col-md-12 " + css(styles.divformElement1)}>
                            <div className={css(styles.formElement1)}>
                                Alias: 
                            </div>
                            <div>
                                <input type="text" className={css(styles.inputElement)} value={this.state.Alias} onChange={ this.updateAlias} />
                                <small id="emailHelp" className="form-text text-muted">Such as Company, Office etc</small>
                            </div>
                        </div>
                }
                </div>

                {
                      this.state.Error &&
                          <div className="alert alert-danger" role="alert">
                              This user has not signed up yet, please invite this user first.
                              <Link to="/invitefriends">
                                <p>
                                    Invite
                                </p>
                              </Link>
                          </div>
                }
                {
                        this.state.OtherError &&
                        <div className="alert alert-danger" role="alert">
                            {this.state.OtherError}
                        </div>
                }
                {
                      this.state.VaultWallet && 
                        <div className="alert alert-success" role="alert">
                            { this.state.VaultWallet }
                        </div>
                }
                <div className={css(styles.textLabel)}>
                    <button className={"btn btn-lg btn-primary " + css(styles.btn)} onClick={this.addApprover}>Add Approver</button>
                    {
                        this.state.AddedApproverList.length>0 &&
                          <button className={"btn btn-lg btn-primary " + css(styles.btn)} onClick={this.onCreateWallet}>Create Wallet</button>
                    }
                </div>
            </div>
        );
    }
    
    private updateAlias = (e: any) => {
        this.setState({Alias: e.target.value});
    }

    private updateEmail = (e: any) => {
        this.setState({CrntApprover: e.target.value});
    }

    private addApprover = (e: any) => {
        (e as any).preventDefault();
        const url = setting.apiUrl + '/user/getdetail';
        const data = {email: this.state.CrntApprover};
        const self = this;
        axios.post(url, data, {
                headers: {
                  "content-Type": "application/json",
                }
              }
            )
            .then(function (response) {
                console.log(response.data);
                if(response.data.status == 'Error') {
                    self.setState({Error: response.data.message});
                } else {
                    const AddedApproverList = self.state.AddedApproverList.slice();
                    AddedApproverList.push({Email: response.data.Email, Wallet: response.data.ApprovalAddress});
                    self.setState({AddedApproverList, CrntApprover: '', Error:''});
                }
            })
            .catch(function (error) {
            console.log(error);
         });
    }

    private onCreateWallet = (e: any) => {
        (e as any).preventDefault();
        if(!this.state.Alias){
            this.setState({OtherError: 'Alias can not be empty'});
            return;
        }

        const url = setting.apiUrl + '/user/createwallet';
        const EmailList:String[] = [];
        this.state.AddedApproverList.forEach(approver=>{EmailList.push(approver.Email)})
        const data = {WalletType:'Ethereum', EmailList: EmailList.join(','), Alias: this.state.Alias};
        const self = this;
        axios.post(url, data, {
                headers: {
                  "content-Type": "application/json",
                }
              }
            )
            .then(function (response) {
                console.log(response.data);
                if(response.data.status == 'Error') {
                    self.setState({WalletError: response.data.message});
                } else {
                    self.setState({VaultWallet: 'We are processing your request and will notify you once it is complete', WalletError:'', Error:''});
                }
            })
            .catch(function (error) {
            console.log(error);
         });
    }
}

const styles = StyleSheet.create({
    btn: {
        cursor: 'pointer',
        marginLeft: '10px'
    },
    frientList:{
        backgroundColor: "white",
        listStyleType: "none",
        margin: "13px",
        padding:"0px"  
    },
    textLabel: {
        marginLeft: '5px',
        marginBottom: '10px',
        fontWeight: 'bold'
    },
    formElement: {
        float: 'left',
        marginRight: '5px',
        marginBottom: '5px'
    },
    formElement1: {
        float: 'left',
        marginRight: '5px',
        marginBottom: '5px',
        width: '100px'
    },
    inputElement: {
        width: '400px',
    },
    divformElement1: {
        marginTop: '10px',
    }
})
export default CreateWallet;