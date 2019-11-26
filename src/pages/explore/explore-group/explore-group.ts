import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { TabsPage } from '../../tabs/tabs';
import { GroupDetailPage } from '../../groups/group-detail/group-detail';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { UserLogService } from '../../../services/user_log.service';

@Component({
  selector: 'page-explore-group',
  templateUrl: 'explore-group.html',
})
export class ExploreGroupPage {

  searchTerm: any;
  searchShow = false;
  categoryCheck: any;
  group_none = true;

  requestFlag = {};

  unJoinedGroupList = [];
  penddingGroupList = [];

  buf_unJoinedGroupList = [];
  buf_penddingGroupList = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public toastCtrl: ToastController,
    public groupService: GroupService,
    public authService: AuthService,
    public userLogService: UserLogService
  ) {
    this.categoryCheck = navParams.get('categoryCheck');

    console.log('category check is ...', this.categoryCheck);
  }

  ionViewWillEnter() {
    this.requestFlag = {};

    this.unJoinedGroupList = [];
    this.penddingGroupList = [];

    var that = this;
    var categoryIdList = [];

    Object.keys(this.categoryCheck).forEach(function(id) {
      if(that.categoryCheck[id]) {
        categoryIdList.push(id);
      }
    });

    this.getGroupList(categoryIdList);
  }

  ionViewDidLoad() {
    this.setFilteredItems();
  }

  showSearchBar() {
    this.searchShow = !this.searchShow;
  }

  setFilteredItems() {
    var that = this;

    this.unJoinedGroupList = this.buf_unJoinedGroupList.filter(function (el) {
      return el.data.name.toLowerCase().includes(that.searchTerm.toLowerCase());
    });

    this.penddingGroupList = this.buf_penddingGroupList.filter(function (el) {
      return el.data.name.toLowerCase().includes(that.searchTerm.toLowerCase());
    });
  }

  async getGroupList(idList) {
    var groups = [];
    var that = this;

    for (var i = 0; i < idList.length; i ++) {
      groups =  groups.concat(await this.groupService.getGroupsPerCategory(idList[i]));
    }

    if (groups.length > 0)
      this.group_none = false;
    else
      this.group_none = true;
    
    for(var i = 0; i < groups.length; i ++) {

      var penddingGroup = groups[i].data.pendding.find(function (el) {
        return el == that.authService.user.uid;
      });

      if(penddingGroup)
        this.penddingGroupList.push({id: groups[i].id, data: groups[i].data});
      else {
        this.unJoinedGroupList.push({id: groups[i].id, data: groups[i].data});

        this.requestFlag[groups[i].id] = true;
      }

    }

    this.buf_unJoinedGroupList = this.unJoinedGroupList;
    this.buf_penddingGroupList = this.penddingGroupList;
  }

  async requestJoin(group_name, group_id) {
    this.groupService.joinRequest(group_id, this.authService.user.uid);
    
    var meta = {
      name: group_name.toUpperCase(),
      description: "requested to join"
    }

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
  goToMainPage() {
    this.navCtrl.setRoot(TabsPage);
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

}
