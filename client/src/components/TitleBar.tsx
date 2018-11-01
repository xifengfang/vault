import * as React from 'react';
import { css,StyleSheet } from 'aphrodite/no-important';


interface IWelcomeProps {
    name: string
   }
const TitleBar: React.SFC<IWelcomeProps> = (props) => {
    return <div>
        <h4 className={css(styles.titlebar)}>{props.name}</h4>
        </div>;
}
 
const styles = StyleSheet.create({
    titlebar: {
        background: "#6E77A0",
        padding: "12px 0px 13px 17px",
        color: "white",
        margin: "0px",
        fontSize: "20px"
    }
});
export default TitleBar;