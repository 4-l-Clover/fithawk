import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { MorePage } from '../../more/more';
import { UploadMediaPage } from '../../groups/upload-media/upload-media';
import { EventListPage } from '../../events/event-list/event-list';
import { MediaListPage } from '../media-list/media-list';
import { GroupMemberPage } from '../group-member/group-member';
import { JoinRequestPage } from '../join-request/join-request';
import { GroupService } from '../../../services/group.service';
import { UserLogService } from '../../../services/user_log.service';
import { AuthService } from '../../../services/auth.service';
import { MediaService } from '../../../services/media.service';
import { GroupPostPage } from '../group-post/group-post';
import * as zipcodes from "zipcodes";

@Component({
  selector: 'page-group-detail',
  templateUrl: 'group-detail.html',
})
export class GroupDetailPage {
  pageKind: any;
  slider: any;
  group_id = '';
  groupInfo = {};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController,
    public groupService: GroupService,
    public toastCtrl: ToastController,
    public userLogService: UserLogService,
    public authService: AuthService,
    public loadingCtrl: LoadingController,
    public mediaService: MediaService,
    public alertCtrl: AlertController
  ) {
    this.pageKind = navParams.get('data');

    this.group_id = navParams.get('group_id');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupDetailPage');
  }

  ionViewWillEnter() {
    this.slider = [
      {
        src: "assets/imgs/fithawk-orange.png",
        flag: 0
      }
    ];

    this.groupInfo = {};

    this.getGroupDetail();
  }

  more(myEvent) {
    let popover = this.popoverCtrl.create(MorePage, {
      data: 'group'
    });
    popover.present({
      ev: myEvent
    });
  }

  updateIndicatorPosition() {
    var frameZones = Array.from(document.querySelectorAll('ion-slide #bgvid'));

    frameZones.forEach((videoElem) => {
      var mediaEl = <HTMLMediaElement>videoElem;
      mediaEl.pause();
    });

    var videoElem = <HTMLMediaElement>document.querySelector('ion-slide.swiper-slide-active #bgvid');
    if(videoElem) videoElem.play();
  }

  goToUploadMedia() {
    this.navCtrl.push(UploadMediaPage, {
      group_id: this.group_id,
      group_name: this.groupInfo['name'],
      group_avatar: this.groupInfo['avatar']
    });
  }

  goToPutPost() {
    this.navCtrl.push(GroupPostPage, {
      group_id: this.group_id,
      group_name: this.groupInfo['name'],
      group_avatar: this.groupInfo['avatar']
    })
  }

  async requestJoin(group_name) {
    this.groupService.joinRequest(this.group_id, this.authService.user.uid);

    var meta = {
      name: group_name.toUpperCase(),
      description: "requested to join"
    };

    var group = await this.groupService.getGroupById(this.group_id);

    this.userLogService.registerUserLog(this.authService.user.uid, this.group_id, 1, meta, group.avatar);

    let toast = this.toastCtrl.create({
      message: 'Join Request has been sent successfully',
      duration: 3000,
      position: 'top'
    });
    toast.present();

    this.pageKind = 'pendding';
    this.groupInfo['members'] ++;
  }

  leaveGroup() {
    let alert = this.alertCtrl.create({
      title: 'Do you really leave this group?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: (data) => {
            this.leaveGroupProc();
          }
        }
      ]
    });

    alert.present();
  }

  leaveGroupProc() {
    const loading = this.loadingCtrl.create();

    this.groupService.userLeaveGroup(this.authService.user.uid, this.group_id).then((d) => {

      loading.dismiss().then(() => {
        this.navCtrl.pop();
      });
      
    });

    loading.present();
  }

  goToEventList() {
    this.navCtrl.push(EventListPage, {
      data: this.pageKind,
      group_id: this.group_id,
      group_name: this.groupInfo['name']
    });
  }

  goToMediaList() {
    this.navCtrl.push(MediaListPage, {
      data: this.pageKind,
      group_id: this.group_id,
      group_name: this.groupInfo['name'],
      group_avatar: this.groupInfo['avatar']
    })
  }

  goToMemberList(users, name, owner) {
    this.navCtrl.push(GroupMemberPage, {
      members: users,
      name: name,
      owner: owner
    });
  }

  goToRequestList(penddingList, name) {
    this.navCtrl.push(JoinRequestPage, {
      pendding: penddingList,
      name: name,
      id: this.group_id
    });
  }

  async getGroupDetail() {
    const loading = this.loadingCtrl.create();
    loading.present();

    this.groupInfo = await this.groupService.getGroupById(this.group_id);

    if (this.pageKind == 'mine' || this.pageKind == 'member') {
      var buf = await this.mediaService.getList(this.groupInfo['media']);

      if (buf.length != 0) {
        this.slider = [];

        for (var i = 0; i < buf.length; i ++) {

          if (buf[i].flag == 0) {
            this.slider.push(buf[i]);
          }

        }

      }
      
      this.mediaService.mediaList = buf;
    }

    this.groupInfo['created_at'] = new Date(this.groupInfo['created_at']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

    this.groupInfo['name'] = this.groupInfo['name'].toUpperCase();
    this.groupInfo['zip'] = zipcodes.lookup(this.groupInfo['zip']).city + " " + zipcodes.lookup(this.groupInfo['zip']).country;
    
    if (this.pageKind == 'pendding')
      this.groupInfo['members'] = this.groupInfo['users'].length + 1;
    else
      this.groupInfo['members'] = this.groupInfo['users'].length;
    
    this.groupInfo['joinRequests'] = this.groupInfo['pendding'].length;
    this.groupInfo['eventsLength'] = this.groupInfo['events'].length;
    this.groupInfo['mediaLength'] = this.groupInfo['media'].length;

    loading.dismiss();
  }

}
