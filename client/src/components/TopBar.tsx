import * as React from 'react';
import { css,StyleSheet } from 'aphrodite/no-important';
import Toggle from '../assets/images/ic1.png';
import Logo from '../assets/images/Vault-logo.png';
import Notification from '../assets/images/ic2.png';
import Home from '../assets/images/ic4.png';


class TopBar extends React.Component<{onToggle:any},{}> {
    

    public toggle = () =>{
        this.props.onToggle();
    }

    public render() { 
        return ( 
            <div className={css(styles.bgColor)+" row"}>
                <div className="col-3">
                    <img src={Toggle} className={css(styles.img)} alt="Menu Toggle" onClick= {this.toggle}/>
                    <img src={Logo} className={css(styles.logoCss)} alt="Logo"/>
                </div>
                <div className={css(styles.title)+" col-6"}>
                    <h4 className={css(styles.mar0)}>Vault User Portal</h4>
                </div>
                <div className="col-3">
                    <ul className={css(styles.iconRightUl)}>
                        <li className={css(styles.iconRightLi,styles.pr15)}><img src={Notification} className={css(styles.img)} alt="Notification"/> <p className={css(styles.count)}>2</p></li>
                        <li className={css(styles.iconRightLi)}><img src={Home} className={css(styles.img)} onClick={this.goHome} alt="Home"/></li>
                    </ul>
                </div>
            </div>
         );
    }

    private goHome = () => {
        window.location.href = '/';
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
    img:{
        width:'30px',
        height:'auto',
        cursor:'pointer'
    },
    bgColor:{
        backgroundColor:'#2A335C'
    },
    logoCss:{
        width:'160px',
        height:'auto',
        paddingLeft: '20px',
        borderLeft: '1px solid #19224b',
        marginLeft: '15px'
    },
    padRight:{
        paddingRight:'0',
        paddingLeft:'0',
    },
    title:{
        textAlign:'center',
        color:'#ffffff',
        paddingTop:'13px',
    },
    mar0:{
        fontSize:'20px !important',
        marginBottom:'0',
        fontFamily:[gadugi],
        fontWeight:'bold'
    },
    iconRightUl:{
        marginBottom: '0',
        paddingLeft: '0',
        textAlign: 'right'
    },
    iconRightLi:{
        display: 'inline-block',
        position:'relative',
        paddingLeft: '15px',
        borderLeft: '1px solid',
        paddingTop: '10px',
        paddingBottom: '10px',
    },
    pr15:{
        display: 'none',
        paddingRight:'15px'
    },
    count:{
        position: 'absolute',
        top: '3px',
        right: '8px',
        padding: '4px 7px',
        marginBottom: '0',
        lineHeight: '10px',
        borderRadius: '100%',
        background: '#ff2700',
        fontSize: '10px',
        color: '#fff',
        fontFamily: [gadugi]
    }
})

export default TopBar;