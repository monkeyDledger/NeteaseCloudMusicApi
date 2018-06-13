const request = require("request");

const baseUrl = "http://172.20.181.99:3000";

const url = {
  login: baseUrl + "/login?",
  getFans: baseUrl + "/user/followeds?uid=",
  sendPlayList: baseUrl + "/send/playlist?",
  getComment: baseUrl + "/comment/music?"
};

// const phone = "15952031402";
// const password = "cloud1992";

const callback = (err, response, body) => {
  if (err) {
    console.log(err);
  } else {
    const data = JSON.parse(body);
    console.log(data);
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
        sendPlayList(users);
      }
    });
  },

  /**
   * 获取歌曲评论里的用户id
   * @param {*} songId
   * @param {*} offset
   */
  getCommentUserIds: (songId, limit, offset) => {
    offset = offset || 0;
    const reqUrl =
      url.getComment + "id=" + songId + "&limit=" + limit + "&offset=" + offset;
    request(reqUrl, callback);
  },

  /**
   * 群发带歌单私信
   * @param {*} users
   */
  sendPlayList: () => {
    const msg = "大涵新歌，巨好听的南京纪录片主题曲了解一下~";
    const playlist = "2267332860";
    let sendPlayListParam =
      "msg=" + msg + "&playlist=" + playlist + "&user_ids=";
    for (let i = 0; i < users.length; i++) {
      sendPlayListParam += users[i];
      if (i !== users.length - 1) sendPlayListParam += ",";
    }
    console.log(sendPlayListParam);
    request(url.sendPlayList + sendPlayListParam, callback);
  },
};
