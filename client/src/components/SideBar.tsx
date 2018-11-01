import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { css,StyleSheet } from 'aphrodite/no-important';
import * as Dashboard from '../assets/images/ic5.png';
import * as User from '../assets/images/ic7.png';
import * as Wallet from '../assets/images/login-ic1.png';
import * as Settings from '../assets/images/ic9.png';
import * as Logout from '../assets/images/ic10.png';
import axios from 'axios';
const setting = require('../Vaultsetting');

const sidebarList = [
    {
        imgSrc:Dashboard,
        linkname: "DASHBOARD",
        path:"/"
    },
    {
        imgSrc:User,
        linkname: "INVITE FRIENDS",
        path:"/invitefriends"
    },
    {
        imgSrc:Wallet,
        linkname: "CREATE WALLET",
        path:"/createwallet"
    },
    {
        imgSrc:Settings,
        linkname: "SETTINGS",
        path:"/settings"
    }
];
class Sidebar extends React.Component<{toggleShow:boolean}> {
    
    public render() {
        return (
            <div className={this.props.toggleShow === true ? css(styles.paddingZero,styles.rowStyle)+" col-2": "d-none"}>
                <h4 className={css(styles.sidebar)}>Welcome {sessionStorage.getItem('firstName')}</h4>
                <ul className={css(styles.sidebarUl)} >
                    {
                        sidebarList
                        .map((sl,index) => 
                        <li key={index}><NavLink exact to={sl.path} className={css(styles.sidebarUla,styles.sidebarUlaHover)} activeClassName={css(styles.active)}> <img src={sl.imgSrc} alt="icons" className={css(styles.sidebarIcon)} />  {sl.linkname}</NavLink></li>)
                    }
                    <li onClick={this.logout}><a className={css(styles.sidebarUla,styles.sidebarUlaHover)}><img src={Logout} alt="icons" className={css(styles.sidebarIcon)} /> LOGOUT</a></li>
                </ul>
            </div>
        );
    }

    private logout = () =>{
        const url = setting.apiUrl + '/user/logout';
        const data = {
            token: sessionStorage.getItem("token")
        };
        axios.post(url, data, {
            headers: {
              "content-Type": "application/json",
            }
          }
        )
        .then(function (response) {
             console.log(response.data);
             window.location.href = '/login';
         })
         .catch(function (error) {
           console.log(error);
        });
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
    sidebar : {
        textAlign: 'center',
        backgroundColor: '#DDE0E9',
        padding: '12px 0px 12px 12px',
        margin: '0px',
        fontSize:'20px',
        fontFamily:[gadugi],
        color:'#606992'
    },
    sidebarUl : {
        padding: '0px',
        listStyleType: 'none'
    },
    sidebarUla : {
        cursor: 'pointer',
        display: 'list-item',
        color: '#000000',
        height:'62px',
        padding:'20px 0 10px 10px',
        fontSize:'16px',
        fontWeight:'bold',
        borderBottom: '1px solid lightgray',
        fontFamily:[gadugi]
    }, 
    sidebarUlaHover : {
        ':hover' : {
            color:'#000000',
            textDecoration: 'none',
        }
    },
    paddingZero:{
        padding:'0'
    },
    rowStyle:{
        boxShadow:'1px 0 0.5px rgba(0,0,0,0.25)'
    },
    sidebarIcon:{
        width:'25px',
        height:'auto',
        marginRight:'10px'
    },
    active:{
        borderLeftWidth:'4px',
        borderLeftColor:'#ea7f6f',
        borderLeftStyle:'solid',
        background:'linear-gradient(to right,#ffffff,#eeeeee)'
    }
})

export default Sidebar;