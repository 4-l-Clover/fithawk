import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, LoadingController } from 'ionic-angular';

import { MinePage } from '../../groups/mine/mine'
import { OtherGroupPage } from '../../groups/other-group/other-group'
import { EditProfilePage } from '../edit-profile/edit-profile'
import { LoginPage } from '../../login/login';
import { JoinRequestAllPage } from '../../groups/join-request-all/join-request-all';
import { RequestSentPage } from '../../groups/request-sent/request-sent';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { UserLogService } from '../../../services/user_log.service';
import { GroupService } from '../../../services/group.service';
import * as zipcodes from "zipcodes";
@Component({
  selector: 'page-overview',
  templateUrl: 'overview.html',
})
export class OverviewPage {
  pageKind:any;
  profile = {};
  user_id: "";
  userLogList: any;
  joinRequestList = [];
  requestNum = 0;
  requestSentList = [];
  requestSentNum = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController, 
    private auth: AuthService,
    public userService:UserService,
    public userLogService:UserLogService,
    public groupService:GroupService,
    public loadingCtrl: LoadingController
  ) {
    this.pageKind = navParams.get('data');
    this.user_id = navParams.get('user_id');
    
    console.log('profile is...', this.user_id);
  }

  ionViewWillEnter() {
    this.profile = {};
    this.userLogList = [];
    this.joinRequestList = [];
    this.requestNum = 0;
    this.requestSentList = [];
    this.requestSentNum = 0;
    
    this.userService.getUser(this.user_id).then((res) => {
      this.profile = res;

      this.profile['name'] = this.profile['name'].toUpperCase();
      this.profile['created_at'] = new Date(this.profile['created_at']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      this.profile['location'] = zipcodes.lookup(this.profile['zip']).city + " " + zipcodes.lookup(this.profile['zip']).country;

    });

    if (this.pageKind == 'other') {
      this.getUserLogInfo();
    } else {
      this.getRequestAndSentList();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OverviewPage');
  }

  activity () {

  }

  goToEdit() {
    //console.log('profile is ...', this.profile);
    this.navCtrl.push(EditProfilePage, {
      profile: this.profile
    });
  }

  getUserLogInfo() {
    const loading = this.loadingCtrl.create();
    
    this.userLogService.getUserLog(this.user_id).then(res => {
      loading.dismiss();
      this.userLogList = res;

      console.log('user log list is ...', this.userLogList);
    });

    loading.present();
  }
  
  goToMyGroupList(kind) {
    this.navCtrl.push(MinePage, {
      data: kind
    });
  }

  goToOtherGroupList(kind) {
    this.navCtrl.push(OtherGroupPage, {
      data: kind,
      user_id: this.user_id
    });
  }

  logOut() {
    this.auth.signOut();
    this.navCtrl.setRoot(LoginPage);
  }

  async getRequestAndSentList() {
    const loading = this.loadingCtrl.create();
    loading.present();

    var returnData1 = await this.groupService.getJoinRequestsAll(this.auth.user.uid);
    var returnData2 = await this.groupService.getSentRequestsAll(this.auth.user.uid);

    this.joinRequestList = returnData1['list'];
    this.requestSentList = returnData2['list'];

    this.requestNum = returnData1['num'];
    this.requestSentNum = returnData2['num'];

    loading.dismiss();
  }

  goToJoinRequest() {
    this.navCtrl.push(JoinRequestAllPage, {
      requestList: this.joinRequestList
    });
  }
  
  goToRequestSent() {
    this.navCtrl.push(RequestSentPage, {
      sentList: this.requestSentList
    });
  }

  // more(myEvent) {
  //   let popover = this.popoverCtrl.create(MorePage, {
  //     data: 'logout'
  //   });
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

}
