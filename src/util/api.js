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

module.exports = {
  /**
   * 手机登录
   * @param {} loginInfo
   */
  login: (phone, password) => {
    const loginInfo = "phone=" + phone + "&" + "password=" + password;
    request(url.login + loginInfo, callback);
  },

  /**
   * 获取自己粉丝id列表
   * @param {*} uid
   */
  getFans: uid => {
    return new Promise(resolve => {
      const users = [];
      request(url.getFans + uid, (err, response, body) => {
        if (err) {
          console.log(err);
        }
        if (!err && response.statusCode == 200) {
          //输出返回的内容
          const data = JSON.parse(body);
          const followeds = data.followeds;
          followeds.forEach(item => {
            users.push(item.userId);
          });
          console.log(users);
          resolve(users);
        }
      });
    });
  },

  /**
   * 获取歌曲评论里的用户id
   * @param {*} songId
   * @param {*} offset
   */
  getCommentUserIds: (songId, limit, offset) => {
    return new Promise(resolve => {
      offset = offset || 0;
      limit = limit || 20;
      const reqUrl =
        url.getComment +
        "id=" +
        songId +
        "&limit=" +
        limit +
        "&offset=" +
        offset;
      request(reqUrl, (err, response, body) => {
        if (err) {
          console.log(err);
          resolve();
        } else {
          const data = JSON.parse(body);
          resolve(data);
        }
      });
    });
  },

  /**
   * 群发带歌单私信
   * @param {*} users
   */
  sendPlayList: (param) => {
    request(url.sendPlayList + param, callback);
  }
};
