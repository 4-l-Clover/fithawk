import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { UploadPhotoPage } from '../upload-photo/upload-photo';
import { PhotoDetailPage } from '../photo-detail/photo-detail';
import { EventService } from '../../../services/event.service';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'page-photo-list',
  templateUrl: 'photo-list.html',
})
export class PhotoListPage {
  photos = [];
  event_id = '';
  photoList = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public eventService: EventService,
    public mediaService: MediaService,
  ) {
    this.photos = navParams.get('photos');
    this.event_id = navParams.get('event_id');
  }

  ionViewWillEnter() {
    this.photos = this.eventService.event_detail['photos'];
    this.photoList = [];

    this.getPhotoList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PhotoListPage');
  }

  goToUploadPage() {
    this.navCtrl.push(UploadPhotoPage, {
      event_id: this.event_id
    });
  }

  detailView(photo) {
    this.navCtrl.push(PhotoDetailPage, {
      photo: photo
    });
  }

  async getPhotoList() {
    const loading = this.loadingCtrl.create();
    loading.present();

    this.photoList = await this.mediaService.getList(this.photos);
    
    loading.dismiss();
  }

}
