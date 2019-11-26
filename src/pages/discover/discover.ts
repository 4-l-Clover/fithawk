import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { DiscoverGroupPage } from '../groups/discover-group/discover-group';
import {CreateGroupPage}  from '../groups/create-group/create-group';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'page-discover',
  templateUrl: 'discover.html',
})
export class DiscoverPage {
  categories = Array();

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private categoryService: CategoryService,
    public userService: UserService,
    public authService: AuthService,
    public loadingCtrl: LoadingController,
  ) {
  }
  
  ionViewWillEnter() {
    this.getCategoryInfo();
  }
  
  ionViewDidLoad() {
  }

  goToGroupList(id, name) {
    this.navCtrl.push(DiscoverGroupPage, {
      category_id: id,
      category_name: name
    });
  }

  async getCategoryInfo() {
    const loading = this.loadingCtrl.create();
    loading.present();

    this.categories = await this.categoryService.getCategory();
    loading.dismiss();
  }

  goToCreatePage() {
    //this.navCtrl.rootNav.push(ViewController);
    this.navCtrl.push(CreateGroupPage);
  }

}
