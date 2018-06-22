const api = require("./util/api");

const { MusicClient } = require("netease-music-sdk");
const client = new MusicClient();

const baseUrl = "http://localhost:3000";
// const baseUrl = "http://192.168.0.132:3000";

const url = {
  login: baseUrl + "/login?",
  getFans: baseUrl + "/user/followeds?uid=",
  sendPlayList: baseUrl + "/send/playlist?",
  getComment: baseUrl + "/comment/music?"
};

// const phone = "15952031402";
// const password = "cloud1992";
const phone = "13276668061",
  password = "YONGYUAN82v";

// api.login(phone, password);

const songIds = {
  可惜我不会喝酒: "554242502",
  追风筝的少年: "543988026",
};

const songId = songIds["追风筝的少年"];
const msg = "用了所有的方式，来爱这个城市，南京。";
// const msg = "这首歌会成为今年的爆款！";
const playlist = "2267332860";

// 大概估算，超过50的时候会超时，前面的用户仍能发送成功，重复发送会失败，返回id=-1
client.phoneLogin(phone, password).then(() => {
  client.getSongComment(songId, 20, 400).then(data => {
    const comments = data.comments;
    const uids = [];
    comments.forEach(comment => {
      const user = comment.user;
      uids.push(user.userId);
    });
    console.log(uids);
    let sendPlayListParam =
      "msg=" + msg + "&playlist=" + playlist + "&user_ids=";
    for (let i = 0; i < uids.length; i++) {
      sendPlayListParam += uids[i];
      if (i !== uids.length - 1) sendPlayListParam += ",";
    }
    sendPlayListParam += "&timestamp=" + Date.now();
    console.log(url.sendPlayList + sendPlayListParam);
    // api.sendPlayList(sendPlayListParam);
    client.sendPlaylistMessage(uids, msg, playlist).then(data => {
      console.log('send success');
    }).catch(err => {
      console.log(err);
    })
  });
});
