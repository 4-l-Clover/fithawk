import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

@Component({
  selector: 'page-compose',
  templateUrl: 'compose.html',
})
export class ComposePage {

  public message: {name: string, title: string};
  pageKind: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController) {
    
    this.pageKind = navParams.get('data');
    
    if (this.pageKind == 'create') {
      this.message = {name: '', title: ''};
    } else {
      this.message = {name: 'JASON PETERSON', title: ''};
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComposePage');
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  compose () {
    this.presentToast('Message is sent successfully.');
  }

}
