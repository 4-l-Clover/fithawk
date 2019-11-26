import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { EventCreatePage } from '../event-create/event-create';
import { EventDetailPage } from '../event-detail/event-detail';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'page-event-list',
  templateUrl: 'event-list.html',
})
export class EventListPage {

  pageKind:any;
  group_id: any;
  eventList = [];
  group_name = '';
  no_events = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public eventService: EventService,
    public authService: AuthService
  ) {
    this.pageKind = navParams.get('data');
    this.group_id = navParams.get('group_id');
    this.group_name = navParams.get('group_name');

    console.log('page kind is ...', this.pageKind);
  }

  ionViewWillEnter() {
    this.eventList = [];
    this.no_events = false;

    this.getEventList();
  }

  async getEventList() {
    var that = this;

    const loading = this.loadingCtrl.create();
    loading.present();

    var events = await this.eventService.getEventsPerGroup(this.group_id);

    var hash = Object.create(null);
    var groupedEventList = [];

    events.forEach(function (o) {
      var key = o.data.start_date.slice(0, 10);

      if (!hash[key]) {
          hash[key] = [];
          groupedEventList.push(hash[key]);
      }

      hash[key].push(o);
    });

    groupedEventList.sort((a, b) => new Date(a[0].data.start_date).getTime() - new Date(b[0].data.start_date).getTime());

    groupedEventList.forEach(function (el) {
      var item = {
        start_date: new Date(el[0].data.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}).toUpperCase(),
        list: []
      };

      el.sort((a, b) => parseInt(a.data.start_time.split(':')[0]) * 10 + parseInt(a.data.start_time.split(':')[1]) - parseInt(b.data.start_time.split(':')[0]) * 10 - parseInt(b.data.start_time.split(':')[1]));
      
      el.forEach(sub_el => {
        var subItem = {};

        subItem['event_id'] = sub_el.id;
        subItem['tagline'] = sub_el.data.tag_line;
        subItem['title'] = sub_el.data.name.toUpperCase();
        subItem['location'] = sub_el.data.zip.toUpperCase();

        var time = parseInt(sub_el.data.start_time.split(':')[0]);
        var time_prefix = 'AM';

        if (time > 12) {
          time = time - 12;
          time_prefix = 'PM';
        }

        subItem['start_time'] = time + ':' + sub_el.data.start_time.split(':')[1] + ' ' + time_prefix;
        subItem['comments'] = sub_el.data.comments;
        subItem['description'] = sub_el.data.description;
        subItem['photos'] = sub_el.data.photos;
        subItem['start_date'] = new Date(sub_el.data.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}).toUpperCase();

        var rsvp = sub_el.data.members.find(function (el) {
          return el.user_id == that.authService.user.uid;
        });

        if (!rsvp)
          subItem['rsvp'] = 0;
        else
          subItem['rsvp'] = rsvp.rsvp_status;

        var attendMembers = [];

        sub_el.data.members.forEach(element => {
          if (element.rsvp_status == 1) {
            attendMembers.push(element.user_id);
          }
        });

        subItem['going'] = attendMembers;

        item.list.push(subItem);
      });

      that.eventList.push(item);
    });

    if (this.eventList.length == 0) {
      this.no_events = true;
    } else {
      this.no_events = false;
    }

    loading.dismiss();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventListPage');
  }

  goToCreatePage() {
    this.navCtrl.push(EventCreatePage,  {
      data: 'create',
      group_id: this.group_id,
      group_name: this.group_name
    });
  }

  goToDetail(event) {
    this.navCtrl.push(EventDetailPage, {
      data: this.pageKind,
      event: event
    });
  }

}
