import * as React from 'react';
import { css, StyleSheet } from 'aphrodite/no-important';
import BannerLogo from '../assets/images/Vault-logo.png';
import BackgroundImage from '../assets/images/login-bg.png';
import axios from 'axios';
const setting  = require('../Vaultsetting');

interface ISate {
  wallet: string;
  error?: string;
}

class Login extends React.Component<{}, ISate> {
  private web3: any;
  constructor(props: any) {
      super(props);
      this.state = {wallet: ''};
      this.web3 = (window as any).web3;
      // this.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/UQ4gSLQXTJohbznyC7PP'));
      // this.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/UQ4gSLQXTJohbznyC7PP'));
  }

  public componentWillMount() {
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

    return (
      <div className={css(styles.bgImg)} style={height}>
        <div className="container">
          <div className="row">
            <div className="offset-md-3 col-md-6 col-12 text-center">
              <div className={css(styles.pad)}>
                <img src={BannerLogo} alt="Logo" />
                <h3 className={css(styles.loginTitle)}>Vault Self Service Portal</h3>
                <form className={css(styles.pForm)}>
                  <button className={css(styles.signButton) + " btn btn-block"} type="button" onClick={this.onLogin}>Login</button>
                  <div className={css(styles.signupbtn)}>
                    <div className={css(styles.signuptext)}>do not have account yet?</div>
                    <button className={css(styles.signupButton) + " btn btn-block"} type="button" onClick={this.onSignup}>Sign Up</button>
                  </div>                  
                  {
                      this.state.error &&
                          <div className="alert alert-danger" role="alert">
                              { this.state.error }
                          </div>
                  }
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  private onLogin = (e: any) => {
    (e as any).preventDefault();

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
        const url = setting.apiUrl + '/user/login';
        const data = {
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
                sessionStorage.setItem("firstName", response.data.firstName);
                sessionStorage.setItem("userId", response.data.userId);
                //(self.props as any).history.push('/');
                window.location.href = '/';
              }
          })
          .catch(function (error) {
            console.log(error);
            self.setState({error: 'system error, please try again later'});
          });
    })
  }

  private onSignup = (e: any) => {
    (e as any).preventDefault();
    window.location.href = '/signup';
    //(this.props as any).history.push('/signup');
  }
}

const gadugi = {
  fontFamily: "gadugi",
  fontStyle: "regular",
  fontWeight: "normal",
  src: `url('/assets/fonts/gadugi.woff2') format('woff2')",
         "url('/assets/fonts/gadugi.woff') format('woff')",
      "url('/assets/fonts/gadugi') format('otf')"`
};

const styles = StyleSheet.create({
  img: {
    width: '36px',
    borderRight: '1px solid #4d4d4d',
    paddingRight: '10px',
    height: 'auto'
  },
  bgImg: {
    backgroundImage: 'url(' + BackgroundImage + ')',
    backgroundSize: 'cover',
    backgroundPosition: 'bottom left',
    backgroundRepeat: 'no-repeat',
  },
  loginTitle: {
    fontFamily: [gadugi],
    fontSize: '30px',
    color: '#ffffff',
    padding: '15px 0'
  },
  pForm: {
    padding: '0 50px 50px 50px'
  },
  signButton: {
    borderRadius: '10px',
    background: '#6e77a0',
    boxShadow: '0 0 15px rgba(0,0,0,0.4)',
    border: '#fff solid 1px',
    fontFamily: [gadugi],
    fontSize: '24px',
    color: '#fff',
    fontWeight: 600,
    marginTop:'25px',
    marginBottom: '25px'
  },
  signuptext: {
    color: 'white'
  },
  signupButton: {
    borderRadius: '10px',
    background: '#6e77a0',
    boxShadow: '0 0 15px rgba(0,0,0,0.4)',
    border: '#fff solid 1px',
    fontFamily: [gadugi],
    fontSize: '24px',
    color: '#fff',
    fontWeight: 600,
    marginTop:'0px'
  },
  signGroup: {
    background: '#6e77a0',
    boxShadow: '0 0 15px rgba(0,0,0,0.4)',
    border: '#4d4d4d solid 1px',
    fontFamily: [gadugi],
    fontSize: '24px',
    color: '#4d4d4d',
    borderRadius:'10px'
  },
  borderRad: {
    borderRadius: '10px',
    padding: '10px 10px',
    backgroundColor: '#ffffff',
    border: 'none'
  },
  padRemRow: {
    padding: '15px 0'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '6px',
    marginLeft: '-15px'
  },
  checkboxLabel: {
    fontSize: '20px',
    color: '#fff',
    fontFamily: [gadugi],
    marginLeft: '10px'
  },
  forPwdA: {
    color: '#fff',
    textDecoration: 'none'
  },
  forPwdP: {
    fontSize: '18px',
    fontFamily: [gadugi]
  },
  forPwdS: {
    fontSize: '20px',
    color: '#6e77a0'
  },
  forPwdH:{
    ':hover':{
      color:'#fff',
      textDecoration:'none'
    }
  },
  pZero:{
    padding:0
  },
  pad:{
    paddingTop:'20px'
  },
  focus:{
    ':focus':{
      boxShadow:'none'
    }
  },
  signupbtn: {
    marginBottom: '10px'
  }
})

const height = {
  height: window.innerHeight
}


export default Login
