import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ExploreGroupPage } from '../explore-group/explore-group';
import { TabsPage } from '../../tabs/tabs';

@Component({
  selector: 'page-explore-category',
  templateUrl: 'explore-category.html',
})
export class ExploreCategoryPage {

  categoryCheckFlag = {
    'running': false,
    'baseball': false,
    'cross_fit': false,
    'yoga': false,
    'swimming': false,
    'weighting': false
  };
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExploreCategoryPage');
  }

  public selectCategory(kind) {
    this.categoryCheckFlag[kind] = !this.categoryCheckFlag[kind];
  }

  gotoGroup() {
    this.navCtrl.push(ExploreGroupPage);
  }

  skip() {
    this.navCtrl.push(TabsPage);
  }

}
