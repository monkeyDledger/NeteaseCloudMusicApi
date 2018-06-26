import React from "react";
import { Form, Icon, Input, Button, Checkbox, message } from "antd";
import common from '../util/const';
const FormItem = Form.Item;

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
      }
      const url = "/login?phone=" + values.phone + "&password=" + values.password;
      fetch(common.baseUrl + url, {credentials: "include"}).then(res => res.json()).then(
        data => {
          console.info(data);
          if (data.code === 200){
            // 登录成功
            const nickName = data.profile.nickname;
            message.success('Welcome ' + nickName);
            this.props.loginSuccess(data.profile);
          } else {
            message.error(data.msg);
          }
        }
      );
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
        <div className="login-title">网易云手机号登录</div>
        <FormItem>
          {getFieldDecorator("phone", {
            rules: [{ required: true, message: "Please input your phone!" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="手机号"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Please input your password!" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="密码"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("remember", {
            valuePropName: "checked",
            initialValue: true
          })(<Checkbox>Remember me</Checkbox>)}
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            登录
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const Login = Form.create()(LoginForm);
export default Login;
