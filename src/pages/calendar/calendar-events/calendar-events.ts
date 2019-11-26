import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { EventDetailPage } from '../../events/event-detail/event-detail';
import { AuthService } from '../../../services/auth.service';
import { GroupService } from '../../../services/group.service';

@Component({
  selector: 'page-calendar-events',
  templateUrl: 'calendar-events.html',
})
export class CalendarEventsPage {
  eventList = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public authService: AuthService,
    public groupService: GroupService
  ) {
    this.eventList = navParams.get('eventList');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CalendarEventsPage');
  }

  async goToDetail(detail) {
    const loading = this.loadingCtrl.create();
    loading.present();

    var group_info = await this.groupService.getGroupById(detail.group_id);

    loading.dismiss();

    if (group_info.owner == this.authService.user.uid) {

      this.navCtrl.push(EventDetailPage, {
        pageKind: 'mine',
        event: detail
      });

    } else {

      this.navCtrl.push(EventDetailPage, {
        pageKind: 'member',
        event: detail
      });

    }
  }

}
