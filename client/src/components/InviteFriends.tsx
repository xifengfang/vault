import * as React from 'react';
import TitleBar from './TitleBar';
import {css,StyleSheet } from 'aphrodite/no-important';
import axios from 'axios';
const setting  = require('../Vaultsetting');

interface IState {
    invitedList: string[],
    crtnInvite: string,
    error?: string
}

export class InviteFriends extends React.Component<{}, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            invitedList: [],
            crtnInvite: ""
        }
    }

    public render() { 
        return (
            <div>
                <TitleBar name="Invite Friends"/>
                <div className={css(styles.frientList)}>
                    {
                        this.state.invitedList.map((friend, index) =>
                            <div key={index} className="row">
                                <div className={css(styles.formElement)}> {friend} (Invited)</div>
                            </div>
                        )
                    }
                    <div className="row">
                        <div className={css(styles.formElement)}>Email: <input type="text"  className={css(styles.formInput)} value={this.state.crtnInvite} onChange={ this.updateEmail} /></div>
                    </div>
                </div>
                {
                    this.state.error &&
                        <div className="alert alert-danger" role="alert">
                            { this.state.error }
                        </div>
                }
                <div className={css(styles.textLabel)}>
                    <button className={"btn btn-lg btn-primary " + css(styles.btn)} onClick={this.onInvite}>Invite</button>
                </div>
            </div>
        );
    }

    private updateEmail = (e: any) => {
        this.setState({crtnInvite: e.target.value});
    }

    private onInvite = (e: any) => {
        (e as any).preventDefault();
        const url = setting.apiUrl + '/user/invite';
        const userId = sessionStorage.getItem("userId");
        const data = {InviteeEmail: this.state.crtnInvite, InviterId: userId};
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
                      self.setState({error: response.data.message});
                  } else {
                      const invitedList = self.state.invitedList.slice();
                      invitedList.push(self.state.crtnInvite);
                      self.setState({invitedList});
                  }
              })
              .catch(function (error) {
                console.log(error);
              });
    }
}

const styles = StyleSheet.create({
    btn: {
        marginLeft: '10px',
    },
    frientList:{
        backgroundColor: "white",
        listStyleType: "none",
        margin: "13px",
        padding:"0px"  
    },
    textLabel: {
        marginLeft: '5px',
        marginTop: '20px'
    },
    formElement: {
        float: 'left',
        marginRight: '5px',
        marginBottom: '5px'
    },
    formInput: {
        width: '400px',
    }   
})
export default InviteFriends;