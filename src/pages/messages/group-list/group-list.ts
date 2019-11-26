import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { GroupChatPage } from '../group-chat/group-chat';
import * as zipcodes from "zipcodes";

@Component({
  selector: 'page-group-list',
  templateUrl: 'group-list.html',
})
export class GroupListPage {
  groupList: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public groupService:GroupService,
    public authService:AuthService
  ) {
    this.groupList = [];

    this.getGroupList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupListPage');
  }

  async getGroupList() {
    const loading = this.loadingCtrl.create();
    loading.present();

    var usersGroup = await this.groupService.getOwnerGroup(this.authService.user.uid);

    var joinedGroup = await this.groupService.getUserJoinedGroup(this.authService.user.uid);

    var that = this;
    usersGroup.concat(joinedGroup).forEach(function(group) {
      var memberIds = group.data.users;
      
      var groupMembers = group.data.users.length;

      if (group.data.users.length == 0 && group.data.owner != that.authService.user.uid)
        groupMembers = 1;

      memberIds.push(group.data.owner);

      var item = {
        id: group.id,
        avatar: group.data.avatar,
        name: group.data.name.toUpperCase(),
        members: groupMembers,
        memberIds: memberIds,
        location: zipcodes.lookup(group.data.zip).city + " " + zipcodes.lookup(group.data.zip).country
      }

      that.groupList.push(item);

    });

    console.log('-------->', this.groupList);

    loading.dismiss();
  }

  startChat(group) {
    this.navCtrl.push(GroupChatPage, {
      group: group
    });
  }

}
