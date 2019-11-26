import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { CalendarEventsPage } from '../calendar-events/calendar-events';
import { EventDetailPage } from '../../events/event-detail/event-detail';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { GroupService } from '../../../services/group.service';

@Component({
  selector: 'page-calendar-item',
  templateUrl: 'calendar-item.html',
})
export class CalendarItemPage {

  eventList = [];
  date: any;
  daysInThisMonth: any;
  totalDayPerWeek: any;
  daysInLastMonth: any;
  daysInNextMonth: any;
  monthNames: string[];
  currentDate: any;
  clickedDate: any;
  displayStr: any;
  today: any;

  availableDays = [];

  items = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public eventService: EventService,
    public authService: AuthService,
    public groupService: GroupService,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {
    
    this.date = new Date();
    
    this.today = {
      date: this.date.getDate(),
      month: this.date.getMonth(),
      year: this.date.getFullYear()
    };

    this.clickedDate = {
      date: "null",
      month: "null",
      year: "null"
    };

    this.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  }

  ionViewWillEnter() {
    this.eventList = [];

    this.getEventList();   
  }

  async getEventList() {
    var that = this;

    const loading = this.loadingCtrl.create();
    loading.present();

    var events = await this.eventService.getEventsPerUser(this.authService.user.uid);

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

        subItem['origin_start_date'] = sub_el.data.start_date;
        subItem['origin_start_time'] = sub_el.data.start_time;
        subItem['group_id'] = sub_el.data.group_id;
        subItem['zip'] = sub_el.data.zip;

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

    this.eventService.event_list = this.eventList;

    this.getEvents(this.today.year, this.today.month, this.today.date);
    this.getAvailableDays(this.today.year, this.today.month);

    this.getDaysOfMonth();

    loading.dismiss();
  }

  getDaysOfMonth() {
    this.daysInThisMonth = new Array();

    this.daysInLastMonth = new Array();
    this.daysInNextMonth = new Array();
    this.displayStr = this.monthNames[this.date.getMonth()] + " " + this.date.getFullYear();
    if(this.date.getMonth() === new Date().getMonth() && this.date.getFullYear() === new Date().getFullYear()) {
      this.currentDate = new Date().getDate();
    } else {
      this.currentDate = 999;
    }
  
    var firstDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
    var prevNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
    for(var i = prevNumOfDays-(firstDayThisMonth-1); i <= prevNumOfDays; i++) {
      this.daysInLastMonth.push(i);
    }

    var first = this.date.getDate() - this.date.getDay() - 7; // First day is the day of the month - the day of the week
    var last = first + 20; // last day is the first day + 6
    
    var firstday = new Date(this.date.getFullYear(), this.date.getMonth(), first).getDate();
    
    var lastday = new Date(this.date.getFullYear(), this.date.getMonth(), last).getDate();
    var lastDayThatMonth = new Date(new Date(this.date.getFullYear(), this.date.getMonth(), first).getFullYear(), new Date(this.date.getFullYear(), this.date.getMonth(), first).getMonth()+1, 0).getDate();
    
    var countEnd = lastday;
    if (lastday < firstday) {
      countEnd += lastDayThatMonth;
    }
  
    var thisNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDate();
    for (var i = 0; i < thisNumOfDays; i++) {
      this.daysInThisMonth.push(i+1);
    }
  
    var lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDay();
    //var nextNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0).getDate();
    for (var i = 0; i < (6-lastDayThisMonth); i++) {
      this.daysInNextMonth.push(i+1);
    }
    var totalDays = this.daysInLastMonth.length+this.daysInThisMonth.length+this.daysInNextMonth.length;

    if(totalDays<36) {
      for(var i = (7-lastDayThisMonth); i < ((7-lastDayThisMonth)+7); i++) {
        this.daysInNextMonth.push(i);
      }
    }

    var totalDayShowMonth = new Array();
    this.totalDayPerWeek = new Array();

    for (var i = 0; i < this.daysInLastMonth.length; i ++)
      totalDayShowMonth.push({
        date: "",
        month: this.date.getMonth(),
        year: this.date.getFullYear(),
        available: {'color': ''}
      });

    for (var i = 0; i < this.daysInThisMonth.length; i ++) {
      var itemDay = this.daysInThisMonth[i];

      var found = this.availableDays.find(function(element) {
        return element == itemDay;
      });

      if (found) {
        totalDayShowMonth.push({
          date: this.daysInThisMonth[i],
          month: this.date.getMonth(),
          year: this.date.getFullYear(),
          available: {'color': '#e55725'}
        }); 
      } else {
        totalDayShowMonth.push({
          date: this.daysInThisMonth[i],
          month: this.date.getMonth(),
          year: this.date.getFullYear(),
          available: {'color': '#bbbbbb'}
        }); 
      }
    }

    for (var i = 0; i < this.daysInNextMonth.length; i ++)
      totalDayShowMonth.push({
        date: "",
        month: this.date.getMonth(),
        year: this.date.getFullYear(),
        available: {'color': ''}
      });

    for (var i = 0; i < totalDayShowMonth.length; i += 7) {
      var subArray = [];

      for (var j = i; j < i + 7; j ++)
        subArray.push(totalDayShowMonth[j]);

      this.totalDayPerWeek.push(subArray);
    }

    
    if (this.totalDayPerWeek[this.totalDayPerWeek.length - 1][0].date == "") {
      this.totalDayPerWeek.pop();
    }
  }

  getEvents(year, month, date) {
    this.items = [];

    var todayEvents = this.eventList.find(function (el) {
      return new Date(el.start_date).getFullYear() == year && new Date(el.start_date).getMonth() == month && new Date(el.start_date).getDate() == date;
    });

    if (todayEvents) {
      for (var i = 0; i < todayEvents.list.length; i ++) {
        var item = {
          detail: todayEvents.list[i],
          title: todayEvents.list[i].title,
          icon: 'yellow',
          time: {value: todayEvents.list[i].start_time.split(" ")[0], ampm: todayEvents.list[i].start_time.split(" ")[1]}
        };

        this.items.push(item);
      }
    }
  }

  getAvailableDays(year, month) {
    this.availableDays = [];

    for (var i = 0; i < this.eventList.length; i ++) {

      if (new Date(this.eventList[i].start_date).getFullYear() == year && new Date(this.eventList[i].start_date).getMonth() == month)
        this.availableDays.push(new Date(this.eventList[i].start_date).getDate());

    }
  }

  clickItem(year, month, date) {
    this.getEvents(year, month, date);

    var found = this.availableDays.find(function(element) {
      return element == date;
    });

    if (found) {
      this.clickedDate.year = year;
      this.clickedDate.month = month;
      this.clickedDate.date = date;

      var first = date - new Date(year, month, date).getDay();

      var firstDate = new Date(year, month, first).getDate();

      if (firstDate > date) {
        this.date = new Date(year, month, 1);
      } else {
        this.date = new Date(year, month, first);
      }
      
      this.getDaysOfMonth();
    }
  }

  goToLastMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);

    this.getAvailableDays(this.date.getFullYear(), this.date.getMonth());
    
    this.getDaysOfMonth();
  }
  
  goToNextMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0);

    this.getAvailableDays(this.date.getFullYear(), this.date.getMonth());

    this.getDaysOfMonth();
  }

  goToCalendarItem() {
    this.navCtrl.push(CalendarEventsPage, {
      eventList: this.eventList
    });
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  async goToEventDetail(detail) {
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
