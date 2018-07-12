import React from "react";
import {
  Avatar,
  Steps,
  Input,
  Button,
  message,
  Icon,
  Spin,
  Progress,
  Alert
} from "antd";
import TextArea from "antd/lib/input/TextArea";

import common from "../util/const";

const Step = Steps.Step;

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curStep: 0,
      uids: [],
      playlist: "2271137634",
      playlistDetail: {},
      msg: "这首歌会成为今年的爆款！！！",
      songId: "513363403",
      songName: "梦都大街",
      offset: 0,
      isLoading: true,
      progressStatus: "active"
    };
    this.playlistInput = null;
    this.songInput = null;
    this.msgInput = null;

    this.baseUrl = common.baseUrl;
    this.steps = [
      {
        title: "编辑消息",
        description: "编辑私信内容，包括内容，歌单id"
      },
      {
        title: "获取用户",
        description: "输入歌曲id，即可获取该歌曲评论中的所有用户id"
      },
      {
        title: "发送私信",
        description:
          "私信将群发给获取到id的用户，发送成功后，可在自己的网易云消息中查看"
      }
    ];
  }

  componentDidMount() {
    this.getPlaylistDeatil();
  }

  hanlePlaylistChange() {
    const val = this.playlistInput.input.value || this.state.playlist;
    this.setState({
      playlist: val
    });
  }

  handleMsgChange() {
    const val = this.msgInput.textAreaRef.value || this.state.msg;
    this.setState({
      msg: val
    });
  }

  handleSongChange() {
    const val = this.songInput.input.value || this.state.songName;
    this.setState({
      songName: val
    });
    const curTime = new Date().getTime();
    const _this = this;
    setTimeout(() => {
      if (new Date().getTime() - curTime > 900) {
        _this.getSongDetail(val);
      }
    }, 1000);
  }

  getPlaylistDeatil() {
    const { playlist } = this.state;
    if (playlist) {
      const url = this.baseUrl + "/playlist/detail?id=" + playlist;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          console.log("playlist detail", data);
          if (data.code === 200) {
            const detail = data.playlist;
            this.setState({
              playlistDetail: {
                pic: detail.coverImgUrl,
                name: detail.name,
                creator: detail.creator.nickname
              }
            });
          }
        });
    }
  }

  getSongDetail(val) {
    if (val !== "") {
      const url = this.baseUrl + "/search?keywords=" + val + "&limit=1";
      fetch(url)
        .then(res => res.json())
        .then(data => {
          console.log("song detail", data);
          if (data.code === 200) {
            const result = data.result;
            let songId = this.state.songId;
            if (result.songCount > 0) {
              const song = result.songs[0];
              songId = song.id;
            } else {
              songId = "没有匹配的歌";
            }
            this.setState({ songId });
          }
        });
    }
  }

  // handleRefresh() {
  //   this.setState(
  //     {
  //       offset: this.state.offset + 30
  //     },
  //     () => {
  //       this.getUids();
  //     }
  //   );
  // }

  /**
   * 群发歌单
   */
  sendPlayList(param, offset) {
    const { uids } = this.state;
    let url = param;
    const left = uids.length - offset;
    if (left > 0 && left < 30) {
      for (let i = offset; i < offset + left; i++) {
        url += uids[i];
        if (i !== offset + left - 1) url += ",";
      }
    } else {
      for (let i = offset; i < offset + 30; i++) {
        url += uids[i];
        if (i !== offset + 29) url += ",";
      }
    }
    url += "&timestamp=" + new Date().getTime();
    console.log(url);
    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        let sendMsgs = offset + 30;
        if (data.code === 200 && data.id !== -1) {
          if (left > 0 && left < 30) {
            sendMsgs = offset + left;
            // message.success('已发送' + sendMsgs + "条私信");
            this.setState({
              offset: uids.length,
              progressStatus: "success"
            });
            return;
          }
          this.setState({
            offset: sendMsgs
          });
          // message.success('已发送' + sendMsgs + "条私信");
          const _this = this;
          setTimeout(() => {
            _this.sendPlayList(param, offset + 30);
          }, 300);
        } else {
          message.error("发送失败", data.msg);
          this.setState({
            progressStatus: "exception"
          });
        }
      })
      .catch(err => {
        message.error("哎呀，服务器好像挂掉了...");
        this.setState({
          progressStatus: "exception"
        });
      });
  }

  handleSendMsg() {
    let url = this.baseUrl + "/send/playlist?";
    const uids = this.state.uids;
    if (uids.length > 0) {
      let sendPlayListParam =
        "msg=" +
        this.state.msg +
        "&playlist=" +
        this.state.playlist +
        "&user_ids=";
      this.sendPlayList(url + sendPlayListParam, 0);
      // Modal.success({
      //   title: "私信地址",
      //   width: 580,
      //   maskClosable: true,
      //   content: (
      //     <div>
      //       <Alert
      //         type="info"
      //         message="私信地址如下，已复制到粘贴板，前往新的浏览器标签页地址栏中粘贴即完成私信群发"
      //       />
      //       <div className="msg-url">{url}</div>
      //     </div>
      //   )
      // });
    }
  }

  getUids(uids, offset) {
    let url =
      this.baseUrl +
      "/comment/music?id=" +
      this.state.songId +
      "&limit=100" +
      "&offset=";
    url += offset;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          let comments = data.comments;
          let tmp = [];
          comments.forEach(comment => {
            const user = comment.user;
            tmp.push(user.userId);
          });
          tmp = Array.from(new Set(tmp));
          console.log("tmp", tmp);
          uids = uids.concat(tmp);
          console.log(uids);
          if (comments.length < 100 || uids.length > 4999) {
            this.setState({
              isLoading: false,
              uids,
              uids
            });
            return;
          }
          const _this = this;
          setTimeout(() => {
            _this.getUids(uids, offset + 100);
          }, 200);
        } else {
          message.error(data.msg);
          return;
        }
      });
  }

  prev() {
    const curStep = this.state.curStep - 1;
    this.setState({ curStep });
  }

  next() {
    const curStep = this.state.curStep + 1;
    this.setState({
      curStep
    });

    if (curStep === 2) {
      const songId = this.state.songId;
      this.setState({ songId });
      const { uids } = this.state;
      if (uids.length > 0) {
        this.setState({
          uids: []
        });
      }
      this.setState({
        isLoading: true,
        progressStatus: 'active',
        offset: 0,
      });
      this.getUids([], 0);
    }
  }

  render() {
    const user = this.props.user || {};
    const icon = user.avatarUrl;

    const {
      msg,
      playlistDetail,
      songName,
      uids,
      isLoading,
      offset,
      progressStatus
    } = this.state;

    let content;

    let playlist;
    if (playlistDetail.creator) {
      playlist = (
        <div className="playlist-container">
          <div>私信样式</div>
          <div className="playlist-detail">
            <div>{"分享歌单：" + msg}</div>
            <div className="playlist-content">
              <Avatar src={playlistDetail.pic} shape="square" style={{width: '40px', height: '40px'}}/>
              <div className="playlist-name">
                {'歌单：' + playlistDetail.name}
                <div className="user-name">{'By: ' + playlistDetail.creator}</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      playlist = "";
    }

    const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    const tip = isLoading
      ? "正在获取[" + songName + "] 评论中的用户id"
      : "获取到[" + uids.length + "]用户";
    const percent = Math.round((offset / uids.length) * 100);

    const songCommentIds = isLoading ? (
      <Spin indicator={loadingIcon} tip={tip} />
    ) : (
      <div>
        {tip}
        <div className="send-progress">
          <Progress type="circle" percent={percent} status={progressStatus} />
        </div>
      </div>
    );

    switch (this.state.curStep) {
      case 0:
        content = (
          <div>
            <span className="label">{"歌单id"}</span>
            <Input
              type="number"
              value={this.state.playlist}
              onChange={this.hanlePlaylistChange.bind(this)}
              ref={e => {
                this.playlistInput = e;
              }}
            />
            <span className="label">{"文案"}</span>
            <TextArea
              autosize={{ minRows: 3, maxRows: 6 }}
              value={this.state.msg}
              onChange={this.handleMsgChange.bind(this)}
              ref={e => {
                this.msgInput = e;
              }}
            />
            {playlist}
          </div>
        );
        break;
      case 1:
        content = (
          <div>
            <span className="label">{"歌名"}</span>
            <Input
              type="text"
              value={this.state.songName}
              onChange={this.handleSongChange.bind(this)}
              ref={e => {
                this.songInput = e;
              }}
            />
            <div className="song-details">{this.state.songId}</div>
          </div>
        );
        break;
      default:
        content = <div>{songCommentIds}</div>;
        break;
    }

    return (
      <div>
        <div className="user-info">
          <Avatar src={icon} />
          <span className="name">{user.nickname}</span>
        </div>
        <div className="steps">
          <Steps current={this.state.curStep}>
            {this.steps.map(item => (
              <Step
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </Steps>
        </div>
        <div className="content">{content}</div>
        <div className="steps-action">
          {this.state.curStep < this.steps.length - 1 && (
            <Button type="primary" onClick={this.next.bind(this)}>
              Next
            </Button>
          )}
          {this.state.curStep === this.steps.length - 1 && (
            <Button type="primary" onClick={this.handleSendMsg.bind(this)}>
              发送
            </Button>
          )}
          {this.state.curStep > 0 && (
            <Button style={{ marginLeft: 8 }} onClick={this.prev.bind(this)}>
              Previous
            </Button>
          )}
        </div>
      </div>
    );
  }
}
