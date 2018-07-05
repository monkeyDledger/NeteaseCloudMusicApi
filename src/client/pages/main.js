import React from "react";
import {
  Avatar,
  Steps,
  Input,
  Button,
  message,
  Icon
} from "antd";
import TextArea from "antd/lib/input/TextArea";

import common from '../util/const';

const Step = Steps.Step;

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curStep: 0,
      uids: null,
      playlist: "786275967",
      msg: "这首歌会成为今年的爆款！！！",
      songId: "513363403",
      songName: "梦都大街",
      offset: 0
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
    const val = this.songInput.input.value || this.state.songId;
    this.setState({
      songId: val
    });
    const curTime = new Date().getTime();
    const _this = this;
    setTimeout(() => {
      if ((new Date().getTime() - curTime) > 400) {
        _this.getSongDetail(val);
      }
    }, 500)
  }

  getSongDetail(val) {
    if (val !== '') {
      const url = this.baseUrl + '/search?keywords=' + val;
      fetch(url).then(res => res.json()).then(data => {
        console.log('song detail', data);
        if (data.code === 200) {
          const result = data.result;
          let songName = this.state.songName;
          if (result.songCount > 0) {
            const song = result.songs[0];
            songName = song.name;
          } else {
            songName = '该id没有匹配的歌';
          }
          this.setState({songName})
        }
      })
    }
  }

  handleRefresh() {
    this.setState(
      {
        offset: this.state.offset + 30
      },
      () => {
        this.getUids();
      }
    );
  }

  /**
   * 群发歌单
   */
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
      for (let i = 0; i < uids.length; i++) {
        sendPlayListParam += uids[i].id;
        if (i !== uids.length - 1) sendPlayListParam += ",";
      }
      console.log(sendPlayListParam);
      url += sendPlayListParam + "&timestamp=" + new Date().getTime();
      // copy(url);
      fetch(url, {credentials: "include"}).then(res => res.json()).then(data => {
        console.log(data);
        if (data.code === 200 && data.id !== -1) {
          message.success('群发成功');
          this.handleRefresh();
        } else {
          message.error('发送失败', data.msg);
        }
      }).catch(err => {
        message.error('哎呀，服务器好像挂掉了...');
      })
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

  getUids() {
    let url =
      this.baseUrl + "/comment/music?id=" + this.state.songId + "&limit=30" + "&offset=";
    let offset = this.state.offset || 0;
    url += offset;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          const comments = data.comments;
          const uids = [];
          comments.forEach(comment => {
            const user = comment.user;
            uids.push({
              id: user.userId,
              name: user.nickname,
              avatar: user.avatarUrl
            });
          });
          console.log(uids);
          this.setState({
            uids: uids
          });
        } else {
          message.error(data.msg);
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
      this.getUids();
    }
  }

  render() {
    const user = this.props.user || {};
    const icon = user.avatarUrl;

    let content;
    let targets = [];
    if (this.state.uids && this.state.uids.length > 0) {
      let i = 0;
      this.state.uids.map(item => {
        targets.push(
          <div className="target-avatar" key={i}>
            <Avatar size="large" src={item.avatar} />
            <span className="target-name">{item.name}</span>
          </div>
        );
        i++;
      });
    }

    const tip =
      "待发送用户（" +
      (this.state.offset + 1) +
      " - " +
      (this.state.offset + 30) +
      ")";

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
          </div>
        );
        break;
      case 1:
        content = (
          <div>
            <span className="label">{"歌曲id"}</span>
            <Input
              type="number"
              value={this.state.songId}
              onChange={this.handleSongChange.bind(this)}
              ref={e => {
                this.songInput = e;
              }}
            />
            <div className="song-details">
              {this.state.songName}
            </div>
          </div>
        );
        break;
      default:
        content = (
          <div>
            <div>
              {tip}
              <Icon
                className="refresh-icon"
                type="reload"
                style={{ fontSize: 18, color: "green" }}
                onClick={this.handleRefresh.bind(this)}
              />
            </div>
            {targets}
          </div>
        );
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
