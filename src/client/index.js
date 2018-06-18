import React from "react";
import ReactDOM from "react-dom";

import Login from "./pages/login";
import Main from "./pages/main";

import "antd/dist/antd.css";
import "/index.scss";
import { userInfo } from "os";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      userInfo: {},
    };
  }

  handleLogin(user) {
    this.setState({
      isLogin: true,
      userInfo: user
    });
  }

  render() {
    const main = this.state.isLogin ? (
      <Main
        user={this.state.userInfo} 
      />
    ) : (
      <Login loginSuccess={this.handleLogin.bind(this)} />
    );
    return <div>{main}</div>;
  }
}

const mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
