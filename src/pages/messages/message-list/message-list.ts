import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ComposePage } from '../compose/compose';
import { GroupListPage } from '../group-list/group-list';
import { Chat } from '../chat/chat';
import { AuthService } from "../../../services/auth.service";
import { ChatService} from "../../../services/chat-service";

@Component({
  selector: 'page-message-list',
  templateUrl: 'message-list.html',
})
export class MessageListPage {
  messageList = [];
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public authService: AuthService,
    private chatService: ChatService,
    public loadingCtrl: LoadingController
  ) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessageListPage');
  }

  ionViewWillEnter() {
    this.messageList = [];
    this.getMessageList();
  }

  async getMessageList() {
    const loading = this.loadingCtrl.create();
    loading.present();

    this.messageList = await this.chatService.getMessangerList(this.authService.user.uid);

    this.messageList.sort(function (a, b) {
      if (a.time > b.time)
        return -1;
    });

    loading.dismiss();
  }

  goToComposePage() {
    this.navCtrl.push(ComposePage, {
      data: 'create'
    });
  }

  goToChatPage(id, name) {
    this.navCtrl.push(Chat, {
      toUserId: id,
      toUserName: name
    });
  }

  goToGroupChat() {
    this.navCtrl.push(GroupListPage);
  }

}
