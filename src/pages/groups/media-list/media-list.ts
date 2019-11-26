import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { UploadMediaPage } from '../upload-media/upload-media';
import { MediaDetailPage } from '../media-detail/media-detail';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'page-media-list',
  templateUrl: 'media-list.html',
})
export class MediaListPage {
  pageKind: any;
  group_id = '';
  mediaList = [];
  group_name = '';
  group_avatar = '';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public mediaService: MediaService
  ) {
    this.pageKind = navParams.get('data');
    this.group_id = navParams.get('group_id');
    this.group_avatar = navParams.get('group_avatar');

    this.group_name = navParams.get('group_name');
  }

  ionViewWillEnter() {
    this.mediaList = this.mediaService.mediaList;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MediaListPage');
  }

  goToUploadPage() {
    this.navCtrl.push(UploadMediaPage, {
      group_id: this.group_id,
      group_name: this.group_name,
      group_avatar: this.group_avatar
    });
  }

  detailView(media) {
    this.navCtrl.push(MediaDetailPage, {
      media: media,
      group_id: this.group_id,
      data: this.pageKind
    });
  }

}
