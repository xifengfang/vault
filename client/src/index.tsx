import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import registerServiceWorker from './registerServiceWorker';
import Signup from './components/Signup';
import Login from './components/Login';
import { Route, Switch } from 'react-router';
import { BrowserRouter,withRouter } from 'react-router-dom';
import axios from 'axios';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
        <Route exact path="/" component={ App } />
        <Route path="/signup" component= {withRouter(Signup)}/>
        <Route path="/login" component= {withRouter(Login)}/>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();

axios.interceptors.response.use(undefined, function (error) {
  if(error.response.status === 401) {
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
