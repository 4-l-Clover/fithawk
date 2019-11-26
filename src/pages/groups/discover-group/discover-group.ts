import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import {GroupDetailPage}  from '../group-detail/group-detail';
import {JoinRequestPage} from "../join-request/join-request";
import {GroupMemberPage} from "../../groups/group-member/group-member";
import { AuthService } from '../../../services/auth.service';
import { GroupService } from '../../../services/group.service';
import { UserLogService } from '../../../services/user_log.service';

@Component({
  selector: 'page-discover-group',
  templateUrl: 'discover-group.html',
})
export class DiscoverGroupPage {

  searchTerm : any="";
  searchShow = false;
  category_id = "";
  category_name="";

  requestFlag = {};

  myGroupList = [];
  //adminGroupList = [];
  joinedGroupList = [];
  unJoinedGroupList = [];
  penddingGroupList = [];

  buf_myGroupList = [];
  buf_joinedGroupList = [];
  buf_unJoinedGroupList = [];
  buf_penddingGroupList = [];

  noneAnyGroups = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public authService: AuthService,
    public groupService: GroupService,
    public userLogService: UserLogService
  ) {
    this.category_id = navParams.get('category_id');
    this.category_name = navParams.get('category_name');
    console.log('current user is...', this.category_id, "<====>", this.authService.user.uid);
  }

  ionViewWillEnter() {
    this.requestFlag = {};
    this.myGroupList = [];
    this.joinedGroupList = [];
    this.unJoinedGroupList = [];
    this.penddingGroupList = [];

    this.getGroupsbyCategory();
  }

  ionViewDidLoad() {
    this.setFilteredItems();
  }

  async getGroupsbyCategory() {
    var groups = await this.groupService.getGroupsPerCategory(this.category_id);

    var that = this;

    if (groups.length == 0) {
      this.noneAnyGroups = true;
    } else {
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

    this.buf_myGroupList = this.myGroupList;
    this.buf_joinedGroupList = this.joinedGroupList;
    this.buf_unJoinedGroupList = this.unJoinedGroupList;
    this.buf_penddingGroupList = this.penddingGroupList;
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
  
  showSearchBar() {
    this.searchShow = !this.searchShow;
  }
  
  setFilteredItems() {
    var that = this;

    this.myGroupList = this.buf_myGroupList.filter(function (el) {
      return el.data.name.toLowerCase().includes(that.searchTerm.toLowerCase());
    });

    this.joinedGroupList = this.buf_joinedGroupList.filter(function (el) {
      return el.data.name.toLowerCase().includes(that.searchTerm.toLowerCase());
    });

    this.unJoinedGroupList = this.buf_unJoinedGroupList.filter(function (el) {
      return el.data.name.toLowerCase().includes(that.searchTerm.toLowerCase());
    });

    this.penddingGroupList = this.buf_penddingGroupList.filter(function (el) {
      return el.data.name.toLowerCase().includes(that.searchTerm.toLowerCase());
    });
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

  goToJoinRequestList(pendding, name, id) {
    this.navCtrl.push(JoinRequestPage, {
      pendding: pendding,
      name: name,
      id: id
    });
  }
  
  goToMembersList(users, name, owner) {
    this.navCtrl.push(GroupMemberPage, {
      members: users,
      name: name,
      owner: owner
    });
  }

}
