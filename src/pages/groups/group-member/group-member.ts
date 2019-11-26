import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
//import { ComposePage } from '../../messages/compose/compose';
import { Chat } from '../../messages/chat/chat';
import { OverviewPage } from '../../profile/overview/overview';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import * as zipcodes from "zipcodes";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'page-group-member',
  templateUrl: 'group-member.html',
})
export class GroupMemberPage {
  memberIdList = [];
  membersList = [];
  groupName = "";
  groupOwner = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService:UserService,
    public authService: AuthService,
    public loadingCtrl: LoadingController
  ) {
    this.memberIdList = navParams.get('members');
    this.groupName = navParams.get('name').toUpperCase();
    this.groupOwner = navParams.get('owner');

    console.log('this groups owner is ...', this.groupOwner, this.memberIdList);

    this.getMemberList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupMemberPage');
  }

  sendMsgToMember(name, uid) {
    this.navCtrl.push(Chat, {
      toUserName: name,
      toUserId: uid
    });
  }

  goToProfile(uid) {
    this.navCtrl.push(OverviewPage, {
      data: 'other',
      user_id: uid
    })
  }

  async getMemberList() {
    var that = this;

    var filterMe = this.memberIdList.filter(function(el) {
      return el != that.authService.user.uid;
    });

    const loading =  this.loadingCtrl.create();
    loading.present();

    var membersList = await this.userService.getUserList(filterMe);

    if (this.groupOwner != this.authService.user.uid) {
      this.userService.getUser(this.groupOwner).then((res) => {
        var ownerInfo = res;

        this.membersList.push({
          uid: ownerInfo['uid'],
          avatar: ownerInfo['avatar'],
          name: ownerInfo['name'].toUpperCase(),
          location: zipcodes.lookup(ownerInfo['zip']).city + " " + zipcodes.lookup(ownerInfo['zip']).country,
          description: ownerInfo['description'],
          created_at: new Date(ownerInfo['created_at']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          flag: 'admin'
        });

        membersList.forEach(item => {
          this.membersList.push({
            uid: item.uid,
            avatar: item.avatar,
            name: item.name.toUpperCase(),
            location: zipcodes.lookup(item.zip).city + " " + zipcodes.lookup(item.zip).country,
            description: item.description,
            created_at: new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            flag: 'member'
          });
        });

        loading.dismiss();
      });
    } else {
      membersList.forEach(item => {
        this.membersList.push({
          uid: item.uid,
          avatar: item.avatar,
          name: item.name.toUpperCase(),
          location: zipcodes.lookup(item.zip).city + " " + zipcodes.lookup(item.zip).country,
          description: item.description,
          created_at: new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          flag: 'member'
        });
      });

      loading.dismiss();
    }
    //var membersList = await this.userService.getUserList(['FMUO07mSk0W8Broy2ABaZMMBQwv1', 'IumIN9sD05Npg28j6OSGOgZm0Jq1', 'UzII6fy7JNOrky0GkjWijxUKFRp1']);
  }

}
