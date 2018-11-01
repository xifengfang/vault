import * as React from 'react';
import TitleBar from './TitleBar';
import axios  from 'axios';
const setting = require('../Vaultsetting');

interface IState {
    FirstName: string,
    LastName: string,
    Email: string,
    Error?: string
}

export class Settings extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            FirstName: "",
            LastName: "",
            Email: ""
        }
    }

    public componentDidMount()
    {
        const self = this;
        const url = setting.apiUrl + '/user/getdetail';
        const data = {
            userId: sessionStorage.getItem("userId")
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
                 self.setState({Error: response.data.message});
             } else {
                 self.setState({FirstName: response.data.FirstName, LastName: response.data.LastName, Email: response.data.Email})
             }
         })
         .catch(function (error) {
           console.log(error);
        });
    }

    public render() { 
        return (
            <div>
                <TitleBar name="Settings"/>
                <div className="container">
                    <form>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">First Name</label>
                            <input type="text" disabled className="form-control" value={this.state.FirstName} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">Last Name</label>
                            <input type="text" disabled className="form-control" value={this.state.LastName} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Email address</label>
                            <input type="email" disabled className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={this.state.Email} />
                        </div>
                        {
                            this.state.Error &&
                            <div className="alert alert-danger" role="alert">
                                { this.state.Error }
                            </div>
                        }
                    </form>
                </div>
            </div>
        );
    }
}

export default Settings;