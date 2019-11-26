import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Events, Content, NavController, Navbar, LoadingController } from 'ionic-angular';
import { ChatService, ChatMessage, UserInfo } from "../../../services/chat-service";
import { AuthService } from "../../../services/auth.service";
import { UserService } from "../../../services/user.service";
import { GroupService } from "../../../services/group.service";

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class Chat {

  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: ElementRef;
  @ViewChild(Navbar) navBar: Navbar;
  msgList: any;
  user: UserInfo;
  toUser: UserInfo;
  editorMsg = '';
  showEmojiPicker = false;
  isLoading = false;
  groupMembers = [];
  membersNum = 0;

  constructor(
    navParams: NavParams,
    private chatService: ChatService,
    private events: Events,
    public navCtrl: NavController,
    public authService: AuthService,
    public userService: UserService,
    public groupService: GroupService,
    public loadingCtrl: LoadingController
  ) {
    // Get the navParams toUserId parameter
    this.toUser = {
      id: navParams.get('toUserId'),
      name: navParams.get('toUserName')
    };

    this.msgList = [];
    
    //this.getGroupMembers();

    //this.isLoading = true;
    
    // this.userService.getUser(this.authService.user.uid).then((res) => {
    //   this.user = {
    //     id: this.authService.user.uid,
    //     name: res['name'].toUpperCase(),
    //     avatar: res['avatar']
    //   }
    // });
    
    // Get mock user information
    // this.chatService.getUserInfo()
    // .then((res) => {
    //   this.user = res
    // });

    let elements = document.querySelectorAll(".tabbar");

    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = 'none';
      });
    }
  }

  async getGroupMembers() {
    var members = await this.chatService.getUsersGroupMembers(this.authService.user.uid);

    this.membersNum = members.length;

    var slideGroupNum = Math.floor(this.membersNum / 5) + 1;

    for(var i = 0; i < slideGroupNum; i ++) {
      var item = [];

      for(var j = 0; j < 5; j ++) {

        if ((j + i * 5) < this.membersNum)
          item.push(members[j + i * 5]);
      }

      this.groupMembers.push(item);
    }

    console.log('-------------->', this.groupMembers);
  }

  ionViewDidLoad() {
    this.navBar.backButtonClick = (e:UIEvent)=>{
      
      let elements = document.querySelectorAll(".tabbar");

      if (elements != null) {
        Object.keys(elements).map((key) => {
          if (elements[key].style.display == 'none') {
            elements[key].style.display = '';
          }
        });
      }
      
      this.navCtrl.pop();
    }
  }

  ionViewWillLeave() {
    // unsubscribe
    this.events.unsubscribe('chat:received');
  }

  ionViewDidEnter() {
    //get message list
    //this.getMsg(this.user.id, this.toUser.id);

    const loading = this.loadingCtrl.create();

    this.userService.getUser(this.authService.user.uid).then((res) => {
      this.user = {
        id: this.authService.user.uid,
        name: res['name'].toUpperCase(),
        avatar: res['avatar']
      }

      this.chatService.getMsgList(this.user.id, this.toUser.id).then(res => {
        loading.dismiss().then(() => {
          this.msgList = res;
          this.scrollToBottom();
          this.chatService.getNewMsg();
        });
      });

      this.chatService.upDateReadStatus(this.user.id, this.toUser.id);

      this.chatService.setUsersMessageRelation(this.user.id, this.toUser.id);
    });

    loading.present();
    // Subscribe to received  new message events
    this.events.subscribe('chat:received', msg => {
      if (msg.length != 0)
        this.pushNewMsg(msg[0]);
    })
  }

  doRefresh(refresher) {
    if (this.msgList.length != 0) {
      this.isLoading = true;
      this.chatService.extendMsgList(this.user.id, this.toUser.id, this.msgList[0].time).then(res => {
        
        this.isLoading = false;
        this.msgList = this.chatService.extendedMsg.concat(this.msgList);
        
        refresher.complete();
      });
    } else {
      refresher.complete();
    }
  }

  onFocus() {
    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();
  }

  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.focus();
    } else {
      this.setTextareaScroll();
    }
    this.content.resize();
    this.scrollToBottom();
  }

  /**
   * @name getMsg
   * @returns {Promise<ChatMessage[]>}
   */
  getMsg(thisUserId, thatUserId) {
    // Get mock message list
    return this.chatService.getMsgList(thisUserId, thatUserId).then(res => {
      this.msgList = res;
      this.scrollToBottom();
    });
  }

  /**
   * @name sendMsg
   */
  sendMsg() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    const id = Date.now().toString();

    let newMsg = {
      messageId: Date.now().toString(),
      userId: this.user.id,
      userName: this.user.name,
      userAvatar: this.user.avatar,
      toUserId: this.toUser.id,
      time: Date.now(),
      message: this.editorMsg,
      status: 'pending',
      read: false
    };

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }

    this.chatService.upDateReadStatus(this.user.id, this.toUser.id);

    this.chatService.sendMsg(newMsg)
    .then(() => {
      let index = this.getMsgIndexById(id);
      if (index !== -1) {
        this.msgList[index].status = 'success';
      }
    })
  }

  /**
   * @name pushNewMsg
   * @param msg
   */
  pushNewMsg(msg) {
    const userId = this.user.id,
    toUserId = this.toUser.id;

    if (this.msgList.length == 0) {
      // Verify user relationships
      if (msg.userId === userId && msg.toUserId === toUserId) {
        this.msgList.push(msg);
      } else if (msg.toUserId === userId && msg.userId === toUserId) {
        this.msgList.push(msg);
      }
    } else {
      if (msg.time != this.msgList[this.msgList.length - 1].time) {
        // Verify user relationships
        if (msg.userId === userId && msg.toUserId === toUserId) {
          this.msgList.push(msg);
        } else if (msg.toUserId === userId && msg.userId === toUserId) {
          this.msgList.push(msg);
        }
      }
    }

    this.scrollToBottom();
  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.messageId === id)
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }

  private focus() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

  private setTextareaScroll() {
    const textarea =this.messageInput.nativeElement;
    textarea.scrollTop = textarea.scrollHeight;
  }

  chatWithOther(otherId, otherName) {
    this.msgList = [];

    const loading = this.loadingCtrl.create();

    this.toUser.id = otherId;
    this.toUser.name = otherName.toUpperCase();

    this.chatService.getMsgList(this.user.id, this.toUser.id).then(res => {
      loading.dismiss().then(() => {
        this.msgList = res;
        this.scrollToBottom();
        
        this.chatService.getNewMsg();
      });
    });

    this.chatService.upDateReadStatus(this.user.id, this.toUser.id);

    this.chatService.setUsersMessageRelation(this.user.id, this.toUser.id);

    loading.present();
  }
}
