import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import {GroupDetailPage}  from '../group-detail/group-detail';
import {JoinRequestPage} from "../join-request/join-request";
import {GroupMemberPage} from "../../groups/group-member/group-member";
import { AuthService } from '../../../services/auth.service';
import { GroupService } from '../../../services/group.service';
import { UserLogService } from '../../../services/user_log.service';

@Component({
  selector: 'page-other-group',
  templateUrl: 'other-group.html',
})
export class OtherGroupPage {

  pageKind:any;
  pageTitle = "HIS/HER GROUPS";
  other_id = "";
  group_none = true;

  requestFlag = {};

  myGroupList = [];
  joinedGroupList = [];
  unJoinedGroupList = [];
  penddingGroupList = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public authService: AuthService,
    public groupService: GroupService,
    public toastCtrl: ToastController,
    public userLogService: UserLogService
  ) {
    this.pageKind = navParams.get('data');
    this.other_id = navParams.get('user_id');

    // let elements = document.querySelectorAll(".tabbar");

    // if (elements != null) {
    //   Object.keys(elements).map((key) => {
    //     if (elements[key].style.display == 'none') {
    //       elements[key].style.display = '';
    //     }
    //   });
    // }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MinePage', this.pageKind);
  }

  ionViewWillEnter() {
    this.requestFlag = {};
    this.myGroupList = [];
    this.joinedGroupList = [];
    this.unJoinedGroupList = [];
    this.penddingGroupList = [];

    if (this.pageKind == 'joined') {
      this.pageTitle = "JOINED GROUPS";

      this.getOtherJoinedGroups();
    } else {
      this.getOtherOwnGroups();
    }
  }

  async getOtherJoinedGroups() {
    this.getClassificGroups(await this.groupService.getUserJoinedGroup(this.other_id));
  }

  async getOtherOwnGroups() {
    this.getClassificGroups(await this.groupService.getOwnerGroup(this.other_id));
  }

  getClassificGroups(groups) {

    if (groups.length > 0)
      this.group_none = false;
    else
      this.group_none = true;

    var that = this;
    
    for(var i = 0; i < groups.length; i ++) {
        
      var joinedGroup = groups[i].data.users.find(function (el) {
        return el == that.authService.user.uid;
      });

      if(joinedGroup)
        this.joinedGroupList.push({id: groups[i].id, data: groups[i].data});

      var penddingGroup = groups[i].data.pendding.find(function (el) {
        return el == that.authService.user.uid;
      });

      if(penddingGroup)
        this.penddingGroupList.push({id: groups[i].id, data: groups[i].data});

      if (groups[i].data.owner == this.authService.user.uid)
        this.myGroupList.push({id: groups[i].id, data: groups[i].data});
      else
        if (!joinedGroup && !penddingGroup) {
          this.unJoinedGroupList.push({id: groups[i].id, data: groups[i].data});

          this.requestFlag[groups[i].id] = true;
        }

    }
  }
  
  goToDetail(kind, id) {
    if(kind == 'no_request' && !this.requestFlag[id]) {
      this.navCtrl.push(GroupDetailPage, {
        data: 'pendding',
        group_id: id
      });
    } else {
      this.navCtrl.push(GroupDetailPage, {
        data: kind,
        group_id: id
      });
    }
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

  async requestJoin(group_name, group_id) {
    this.groupService.joinRequest(group_id, this.authService.user.uid);

    var meta = {
      name: group_name.toUpperCase(),
      description: "requested to join"
    };

    var group = await this.groupService.getGroupById(group_id);

    this.userLogService.registerUserLog(this.authService.user.uid, group_id, 1, meta, group.avatar);

    let toast = this.toastCtrl.create({
      message: 'Join Request has been sent successfully',
      duration: 3000,
      position: 'top'
    });
    toast.present();

    this.requestFlag[group_id] = false;
  }

}
