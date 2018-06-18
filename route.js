const apiRouter = require('express').Router();

const request = require("request");

const baseUrl = "http://172.20.181.99:3000";
// const baseUrl = "http://192.168.0.132:3000";

const url = {
  login: baseUrl + "/login?",
  getFans: baseUrl + "/user/followeds?uid=",
  sendPlayList: baseUrl + "/send/playlist?",
  getComment: baseUrl + "/comment/music?"
};

const callback = (err, response, body) => {
  if (err) {
    console.log(err);
  } else {
    console.log(response.statusCode);
    const data = JSON.parse(body);
  }
};

apiRouter.post('login', (req, res) => {
  const phone = req.body.phone;
  const password = req.body.password;
  const loginInfo = "phone=" + phone + "&" + "password=" + password;
  request(url.login + loginInfo, (err, response, body) => {
    if (err) {
      console.log(err);
    } else {
      console.log(response.statusCode);
      const data = JSON.parse(body);
      res.send(data);
    }
  });
})

exports = apiRouter;