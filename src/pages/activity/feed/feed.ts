import { Component } from '@angular/core';
import {NavController, NavParams, LoadingController, ModalController, ToastController } from 'ionic-angular';
import { UserLogService } from '../../../services/user_log.service';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { EventDetailPage } from '../../events/event-detail/event-detail';
import { GroupDetailPage } from '../../groups/group-detail/group-detail';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
  activityList: any;
  groupList: any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public loadingCtrl: LoadingController,
    public modal: ModalController,
    public toastCtrl: ToastController,
    public userLogService: UserLogService,
    public authService: AuthService,
    public eventService: EventService
  ) {
    this.activityList = navParams.get('notifications');
    this.groupList = navParams.get('groups');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivityPage');
  }

  async ionViewWillEnter() {

    this.activityList.sort(function (a, b) {

      if (a.created_at > b.created_at)
        return -1;
      else
        return 1;
      
    });

    var that = this;

    const loading = this.loadingCtrl.create();
    loading.present();

    for (var i = 0; i < this.activityList.length; i ++) {

      var find = this.activityList[i].read_users.find(function(el) {

        return el == that.authService.user.uid;

      });

      if (!find)
        await this.userLogService.updateLogStatus(this.activityList[i]);

    }

    loading.dismiss();
    
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  async goToDetailPage(activity) {
    if (activity.flag == 4) {

      const loading = this.loadingCtrl.create();
      loading.present();

      var event = await this.eventService.getEventById(activity.event_id);

      var filteredEvent = this.filterEventData(event, activity.event_id);

      var find = this.groupList.find(function (el) {
        return el.id ==  event.group_id
      });

      loading.dismiss();

      if (find) {

        if (find.owner) {

          this.navCtrl.push(EventDetailPage, {
            pageKind: 'mine',
            event: filteredEvent
          });

        } else {

          this.navCtrl.push(EventDetailPage, {
            pageKind: 'member',
            event: filteredEvent
          });

        }

      } else {

        this.presentToast("Error occured");

      }

    } else {

      var find = this.groupList.find(function (el) {
        return el.id ==  activity.group_event_id
      });

      if (find) {

        if (find.owner) {

          this.navCtrl.push(GroupDetailPage, {
            data: 'mine',
            group_id: activity.group_event_id
          });

        } else {

          this.navCtrl.push(GroupDetailPage, {
            data: 'member',
            group_id: activity.group_event_id
          });

        }

      } else {

        this.presentToast("Error occured");

      }
    }
  }

  filterEventData(event, id) {

    var subItem = {};

    subItem['event_id'] = id;
    subItem['tagline'] = event.tag_line;
    subItem['title'] = event.name.toUpperCase();
    subItem['location'] = event.zip.toUpperCase();

    var time = parseInt(event.start_time.split(':')[0]);
    var time_prefix = 'AM';

    if (time > 12) {
      time = time - 12;
      time_prefix = 'PM';
    }

    subItem['start_time'] = time + ':' + event.start_time.split(':')[1] + ' ' + time_prefix;
    subItem['comments'] = event.comments;
    subItem['description'] = event.description;
    subItem['photos'] = event.photos;
    subItem['start_date'] = new Date(event.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}).toUpperCase();

    var that = this;

    var rsvp = event.members.find(function (el) {
      return el.user_id == that.authService.user.uid;
    });

    if (!rsvp)
      subItem['rsvp'] = 0;
    else
      subItem['rsvp'] = rsvp.rsvp_status;

    var attendMembers = [];

    event.members.forEach(element => {
      if (element.rsvp_status == 1) {
        attendMembers.push(element.user_id);
      }
    });

    subItem['going'] = attendMembers;

    return subItem;

  }

}
