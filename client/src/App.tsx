import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/SideBar';
import TopBar from './components/TopBar';
import MainAppSpace from './components/MainAppSpace';
import axios from 'axios';

interface Itoggle {
  show: boolean
}

class App extends React.Component<{}, Itoggle> {

  constructor(props: any) {
    super(props);
    this.state = {
      show: false
    }
  }

  public componentDidMount(){
    if (!sessionStorage.getItem("token")) {
      window.location.href = '/login';
    } else {
        this.setState({show:true});
        console.log(sessionStorage.getItem('token'));
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem('token'); 
    }
  }

  public onToggle = () => {
    this.setState((prevState: Itoggle) => {
      return { show: !prevState.show }
    })
  }

  public render() {
    //if(!this.state.show){
    //  return null;
    //}
    return (
      <BrowserRouter>
        <div className="App">
          <div className="container-fluid">
            <TopBar onToggle={this.onToggle} />
            <div className="row">
              <Sidebar toggleShow={this.state.show} />
              <MainAppSpace toggleShow={this.state.show} />
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
