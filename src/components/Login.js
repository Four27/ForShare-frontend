import React from 'react';
import ReactDOM from 'react-dom';
import { FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';
import { bootstrapUtils } from 'react-bootstrap/lib/utils';
import ajax from 'superagent';
import { browserHistory } from 'react-router';
import{ observer } from 'mobx-react';

import { LoginState } from '../store';
import baseUrl from './config';
import './Login.css';

bootstrapUtils.addStyle(InputGroup.Addon, 'custom-user');
bootstrapUtils.addStyle(InputGroup.Addon, 'custom-password');
bootstrapUtils.addStyle(InputGroup, 'custom');

@observer
class Login extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      validationState: null
    }
  }
  
  pushUserMessage(){
    const content = {
      username: ReactDOM.findDOMNode(this.refs.userName).value,
      password: ReactDOM.findDOMNode(this.refs.passWord).value
    }

    ajax.post(`${baseUrl}/login/`)
      .send(content)
      .end((error, response) => {
        if (error || response.status !== 200) {
          console.log('login failed!');
          this.errorReminder();
        } else {
          LoginState.login(response.body.username, response.body.token);
          browserHistory.push('source-share-list');
          ajax.get(`${baseUrl}/users/`)
          .end((error, response) => {
            if (!error && response){
              LoginState.userid = response.body.results.filter(user => user.username === content.username)[0].id;
            }else{
              console.log("id fetch error!");
              alert("登陆失败，请稍后再试");
              ReactDOM.findDOMNode(this.refs.userName).value = "";
              ReactDOM.findDOMNode(this.refs.passWord).value = "";
            }
          })
        };
      });
  }

  errorReminder = () => {
    let setErrorContent = (value) => {
      ReactDOM.findDOMNode(this.refs.errorReminder).style.display = "block";
      ReactDOM.findDOMNode(this.refs.errorReminder).innerHTML = value;
    }
    if(ReactDOM.findDOMNode(this.refs.userName).value.trim() === "" || ReactDOM.findDOMNode(this.refs.passWord).value === ""){
      setErrorContent("请输入用户名和密码！");
    }else{
      setErrorContent("用户名或密码错误！");
      this.setState({ validationState : "error" });
    }
  }

  render(){
    return(
      <div className="login">
        <h3>登录</h3>
        <form>
          <FormGroup validationState={this.state.validationState}>
            <InputGroup bsStyle="custom">
              <InputGroup.Addon bsStyle="custom-user"></InputGroup.Addon>
              <FormControl type="text" ref="userName" />
            </InputGroup>
          </FormGroup>
          <FormGroup validationState={this.state.validationState}>
            <InputGroup bsStyle="custom">
              <InputGroup.Addon bsStyle="custom-password"></InputGroup.Addon>
              <FormControl type="password" ref="passWord" />
            </InputGroup>
          </FormGroup>
        </form>
        <Button bsStyle="danger" onClick={this.pushUserMessage.bind(this)}>登录</Button>
        <p className="error-reminder" ref="errorReminder"></p>
      </div>
    );
  }
}

export default Login;