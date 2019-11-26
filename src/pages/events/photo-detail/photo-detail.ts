import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';
import { MorePage } from '../../more/more';

@Component({
  selector: 'page-photo-detail',
  templateUrl: 'photo-detail.html',
})
export class PhotoDetailPage {
  photo: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController
  ) {
    this.photo = navParams.get('photo');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PhotoDetailPage');
  }

  more(ev) {
    let popover = this.popoverCtrl.create(MorePage, {
      data: 'photoDetail'
    });
    popover.present({
      ev: ev
    });
  }

}
