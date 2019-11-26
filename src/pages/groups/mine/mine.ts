import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {JoinRequestPage} from "../join-request/join-request";
import {GroupDetailPage}  from '../group-detail/group-detail';
import {CreateGroupPage}  from '../create-group/create-group';
import {GroupMemberPage}  from '../group-member/group-member';
import { AuthService } from '../../../services/auth.service';
import { GroupService } from '../../../services/group.service';

@Component({
  selector: 'page-mine',
  templateUrl: 'mine.html',
})
export class MinePage {

  pageKind:any;
  pageTitle = "MY GROUPS";
  myGroupList = [];
  joinedGroupList = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public authService: AuthService,
    public groupService: GroupService
  ) {
    this.pageKind = navParams.get('data');
    console.log('page kind is ...', this.pageKind);
    if (this.pageKind == 'joined') {
      this.pageTitle = "JOINED GROUPS";
      this.getJoinedGroupList();
    } else {
      this.getMyGroupList();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MinePage', this.pageKind);
  }

  async getMyGroupList() {
    this.myGroupList = await this.groupService.getOwnerGroup(this.authService.user.uid);
  }

  async getJoinedGroupList() {
    this.joinedGroupList = await this.groupService.getUserJoinedGroup(this.authService.user.uid);
  }

  goToCreatePage() {
    //this.navCtrl.rootNav.push(ViewController);
    this.navCtrl.push(CreateGroupPage);
  }

  goToDetail(kind, id) {
    this.navCtrl.push(GroupDetailPage, {
      data: kind,
      group_id: id
    });
  }

  goToMembersList(users, name, owner) {
    this.navCtrl.push(GroupMemberPage, {
      members: users,
      name: name,
      owner: owner
    });
  }

  goToJoinRequestList(pendding, name, id) {
    this.navCtrl.push(JoinRequestPage, {
      pendding: pendding,
      name: name,
      id: id
    });
  }

}
