import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { CreateGroupPage } from '../groups/create-group/create-group';
import { EventCreatePage } from '../events/event-create/event-create';
import { UploadPhotoPage } from '../events/upload-photo/upload-photo';
import { UploadMediaPage } from '../groups/upload-media/upload-media';
//import { LoginPage } from '../login/login';

@Component({
  selector: 'page-more',
  templateUrl: 'more.html',
})
export class MorePage {
  pageKind:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.pageKind = navParams.get('data');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupDetailMorePage');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  goToEditGroup() {
    this.navCtrl.push(CreateGroupPage);
  }

  goToEditEvent() {
    this.navCtrl.push(EventCreatePage);
  }

  goToEditPhoto() {
    this.navCtrl.push(UploadPhotoPage);
  }

  goToEditMedia() {
    this.navCtrl.push(UploadMediaPage);
  }

  logout() {
    //this.navCtrl.setRoot(LoginPage);
  }


}
