import { Component, ElementRef, ViewChild } from '@angular/core';
import { Events, Content, NavController, Navbar, LoadingController, NavParams } from 'ionic-angular';
import { ChatService, ChatMessage, UserInfo } from "../../../services/chat-service";
import { AuthService } from "../../../services/auth.service";
import { UserService } from "../../../services/user.service";
import { GroupService } from "../../../services/group.service";

@Component({
  selector: 'page-group-chat',
  templateUrl: 'group-chat.html',
})
export class GroupChatPage {
  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: ElementRef;
  @ViewChild(Navbar) navBar: Navbar;
  msgList: any;
  user: UserInfo;
  groupMembers = [];
  editorMsg = '';
  showEmojiPicker = false;
  groupName = '';
  membersNum = 0;
  group_id =  '';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private chatService: ChatService,
    private events: Events,
    public authService: AuthService,
    public userService: UserService,
    public groupService: GroupService,
    public loadingCtrl: LoadingController
  ) {
    this.msgList = [];

    this.groupName = navParams.get('group').name;
    this.membersNum = navParams.get('group').members;
    this.group_id = navParams.get('group').id;

    this.getGroupMembers();

    let elements = document.querySelectorAll(".tabbar");

    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = 'none';
      });
    }

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

  async getGroupMembers() {

    var that = this;

    var membersIdBesidesMe = this.navParams.get('group').memberIds.filter(function(el) {
      return el != that.authService.user.uid;
    });

    var members = await this.userService.getUserList(membersIdBesidesMe);

    var slideGroupNum = Math.floor(this.membersNum / 5) + 1;

    for(var i = 0; i < slideGroupNum; i ++) {
      var item = [];

      for(var j = 0; j < 5; j ++) {

        if ((j + i * 5) < this.membersNum)
          item.push(members[j + i * 5]);
      }

      this.groupMembers.push(item);
    }
  }

  ionViewWillLeave() {
    // unsubscribe
    this.events.unsubscribe('chat:group');
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

      this.groupService.getMsgList(this.group_id).then(res => {
        loading.dismiss().then(() => {
          this.msgList = res;
          this.scrollToBottom();
          
          this.chatService.getNewGroupMsg(this.group_id);
        });
      });
    });

    loading.present();
    // Subscribe to received  new message events
    this.events.subscribe('chat:group', msg => {
      if (msg)
        this.pushNewMsg(msg);
    })
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }

  pushNewMsg(msg) {
    const userId = this.user.id;

    if (this.msgList.length == 0) {

      this.msgList.push(msg);

    } else {

      if (msg.time != this.msgList[this.msgList.length - 1].time) {

        this.msgList.push(msg);

      }

    }

    this.scrollToBottom();
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

  private focus() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

  private setTextareaScroll() {
    const textarea =this.messageInput.nativeElement;
    textarea.scrollTop = textarea.scrollHeight;
  }

  sendMsg() {
    if (!this.editorMsg.trim()) return;

    const id = Date.now().toString();

    let newMsg = {
      messageId: Date.now().toString(),
      userId: this.user.id,
      userName: this.user.name,
      userAvatar: this.user.avatar,
      time: Date.now(),
      message: this.editorMsg,
      status: 'pending'
    };

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }

    this.chatService.sendGroupMsg(newMsg, this.group_id);

    let index = this.getMsgIndexById(id);
    if (index !== -1) {
      this.msgList[index].status = 'success';
    }
  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.messageId === id)
  }

}
