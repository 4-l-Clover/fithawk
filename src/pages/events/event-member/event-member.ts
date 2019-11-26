import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Chat } from '../../messages/chat/chat';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

import * as zipcodes from "zipcodes";

@Component({
  selector: 'page-event-member',
  templateUrl: 'event-member.html',
})
export class EventMemberPage {
  title = "";
  memberIdList = [];
  membersList = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService:UserService,
    public authService: AuthService,
  ) {
    this.title = navParams.get('event_name');
    this.memberIdList = navParams.get('members');

    this.getMemberList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventMemberPage');
  }

  sendMsgToMember(name, uid) {
    this.navCtrl.push(Chat, {
      toUserName: name,
      toUserId: uid
    });
  }

  async getMemberList() {
    var that = this;

    var filterMe = this.memberIdList.filter(function(el) {
      return el != that.authService.user.uid;
    });

    var membersList = await this.userService.getUserList(filterMe);

    membersList.forEach(item => {
      this.membersList.push({
        uid: item.uid,
        avatar: item.avatar,
        name: item.name.toUpperCase(),
        location: zipcodes.lookup(item.zip).city + " " + zipcodes.lookup(item.zip).country,
        description: item.description,
        created_at: new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      });
    });
  }

}
