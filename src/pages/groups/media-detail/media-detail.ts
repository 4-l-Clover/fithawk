import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { MorePage } from '../../more/more';
import { MediaService } from '../../../services/media.service';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'page-media-detail',
  templateUrl: 'media-detail.html',
})
export class MediaDetailPage {
  media: any;
  group_id: any;
  pageKind: any;
  accessDeleting = true;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController,
    public toastCtrl: ToastController, 
    public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,
    public mediaService: MediaService,
    public authService: AuthService,
    public groupService: GroupService
  ) {
    this.media = navParams.get('media');
    this.group_id = navParams.get('group_id');
    this.pageKind = navParams.get('data');

    if (this.pageKind == 'mine') {
      this.accessDeleting = true;
    } else {

      if (this.media.user_id == this.authService.user.uid) {
        this.accessDeleting = true;
      } else {
        this.accessDeleting = false;
      }

    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MediaDetailPage');
  }

  more(ev) {
    let popover = this.popoverCtrl.create(MorePage, {
      data: 'mediaDetail'
    });
    popover.present({
      ev: ev
    });
  }

  deleteMedia() {
    let alert = this.alertCtrl.create({
      title: 'Do you really delete this media?',
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
            this.deleteProc();
          }
        }
      ]
    });

    alert.present();
  }

  deleteProc() {

    var that = this;

    const loading = this.loadingCtrl.create();
    loading.present();

    this.mediaService.deleteMedia(this.media.id).then(function () {

      var remainMedia = that.mediaService.mediaList.filter(function (el) {
        return el.id != that.media.id
      });

      that.groupService.updateGroupByDeletedMedia(that.group_id, that.media.id);

      that.mediaService.mediaList = remainMedia;

      that.navCtrl.pop();

      that.presentToast("Deleted");
      loading.dismiss();
    }).catch(function (err) {
      console.log("error ===>", err);
      that.presentToast("Error Occured");
      loading.dismiss();
    });
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
