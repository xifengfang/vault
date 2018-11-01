import * as React from 'react';
import { Route } from 'react-router-dom';
import { css,StyleSheet } from 'aphrodite/no-important';
import Dashboard from './Dashboard';
import InviteFriends from './InviteFriends';
import CreateWallet from './CreateWallet';
import Settings from './Settings'

class MainAppSpace extends React.Component<{toggleShow:boolean}> {
    public render(){
        return (
            <div className={this.props.toggleShow === true ? css(styles.mainAppSpaceBg,styles.paddingZero)+" col-10": css(styles.mainAppSpaceBg,styles.paddingZero)+" col-12"}  style={height}>
            <Route exact path="/" component={Dashboard}/>
            <Route path="/invitefriends" exact component={InviteFriends}/>
            <Route path="/createwallet" exact component={CreateWallet}/>
            <Route path="/settings" exact component={Settings}/>
        </div>
        );
    }

}
const height = {
    height: window.innerHeight-51
}

const styles = StyleSheet.create({
    mainAppSpaceBg:{
        backgroundColor:"rgb(221, 224, 233)",
        overflow:"auto"
    },
    paddingZero:{
        padding:"0px"
    }
});
export default MainAppSpace;