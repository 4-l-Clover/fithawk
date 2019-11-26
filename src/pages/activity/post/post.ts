import { Component } from '@angular/core';
import {NavController, NavParams, ViewController, LoadingController, ModalController, ModalOptions, Modal } from 'ionic-angular';
import { UserLogService } from '../../../services/user_log.service';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { FeedPage } from '../feed/feed';
import { DiscoverPage } from '../../discover/discover';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage {
  activityList: any;
  myModal: Modal;
  showModal = true;
  groupList: any;
  allActivityList: any;
  notificationList: any;
  notificationNum = 0;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController,
    private groupService: GroupService,
    public modal: ModalController,
    public userLogService: UserLogService,
    public userService: UserService,
    public authService: AuthService
  ) {
    this.userService.setMessageRelation(this.authService.user.uid).then((users) => {
      this.userService.message_relation = users;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivityPage');
  }

  triggerModal() {
    if (this.showModal) {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  openModal() {

    this.showModal = false;

    const myModalOptions: ModalOptions = {
      enableBackdropDismiss: false,
      cssClass: 'custom-modal'
    };

    this.myModal = this.modal.create('ModalPage', { data: this.groupList }, myModalOptions);

    this.myModal.present();

    this.myModal.onDidDismiss((data) => {
      console.log("I have dismissed.");
      console.log(data);
    });

    this.myModal.onWillDismiss((data) => {
      console.log("I'm about to dismiss");
      console.log(data);
    });

  }

  closeModal() {
    if (!this.showModal) {
      this.showModal = true;

      this.filterGroups();

      this.myModal.dismiss();
    }
  }

  async ionViewWillEnter() {
    this.notificationNum = 0;
    const loading = this.loadingCtrl.create();

    loading.present();

    this.allActivityList = [];
    this.notificationList = [];

    this.groupList = await this.groupService.getAllGroups();

    var bufActivityList = await this.userLogService.getPosts();

    //getting posts from activities...
    for (var i = 0; i < bufActivityList['post'].length; i ++) {

      var find = this.groupList.find(function (el) {
        return el.id == bufActivityList['post'][i].group_event_id;
      });

      if (find)
        this.allActivityList.push(bufActivityList['post'][i]);

    }

    //getting notifications from activities...
    for (var i = 0; i < bufActivityList['notification'].length; i ++) {

      var find = this.groupList.find(function (el) {
        return el.id == bufActivityList['notification'][i].group_event_id;
      });

      if (find) {
        this.notificationList.push(bufActivityList['notification'][i]);

        var that = this

        var find_me = bufActivityList['notification'][i].read_users.find(function (el) {
          return el == that.authService.user.uid;
        });
  
        if (!find_me)
          this.notificationNum ++;
      }

    }

    this.initCheckList();
    this.filterGroups();

    loading.dismiss();
    
  }

  filterGroups() {
    this.activityList = [];

      for (var i = 0; i < this.allActivityList.length; i ++) {

          if(this.userLogService.group_check_list[this.allActivityList[i].group_event_id]) {

            this.activityList.push(this.allActivityList[i]);
  
          }

      }
  }

  initCheckList() {

    if (!this.userLogService.group_check_list)
      this.userLogService.group_check_list = [];

    for(var i = 0; i < this.groupList.length; i ++) {

      if (this.userLogService.group_check_list[this.groupList[i].id] === undefined) {
        this.userLogService.group_check_list[this.groupList[i].id] = true;
      }

    }
  }

  gotoNotifications() {
    this.navCtrl.push(FeedPage, {
      notifications: this.notificationList,
      groups: this.groupList
    });
  }

  goToDiscoverPage() {
    this.navCtrl.push(DiscoverPage);
  }

}
