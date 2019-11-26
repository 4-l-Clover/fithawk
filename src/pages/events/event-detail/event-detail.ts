import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import { MorePage } from '../../more/more';
import { EventMemberPage } from '../event-member/event-member';
import { UploadPhotoPage } from '../upload-photo/upload-photo';
import { PhotoListPage } from '../photo-list/photo-list';
import { CommentListPage } from '../comment-list/comment-list';
import { EventService } from '../../../services/event.service';
import { MediaService } from '../../../services/media.service';
import { AuthService } from '../../../services/auth.service';

import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {

  pageKind:any;
  slider = [];
  event: any;
  rsvpVal: string;
  extendFlag = false;
  extendText = "[more]";
  distanceTime = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController, 
    public alertCtrl: AlertController,
    public eventService: EventService,
    public authService: AuthService,
    public mediaService: MediaService
  ) {
    this.pageKind = navParams.get('data');

    this.eventService.event_detail = navParams.get('event');

    this.event = this.eventService.event_detail;
    console.log('event is ...', this.event);

    this.distanceTime = distanceInWordsToNow(new Date(this.event.start_date), { addSuffix: true }).toUpperCase();
    

    this.slider = [
      {
        src: "assets/imgs/fithawk-orange.png"
      }
    ];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventDetailPage');
  }

  ionViewWillEnter() {
    this.event = this.eventService.event_detail;

    this.getSlideImage();

    var rsvp = parseInt(this.event.rsvp);

    switch (rsvp) {
      case 0:
        this.rsvpVal = 'RSVP';
        break;
      case 1:
        this.rsvpVal = 'GOING';
        break;
      case 2:
        this.rsvpVal = 'MAY BE';
        break;
      case 3:
        this.rsvpVal = 'NOT GOING';
        break;
    }
  }

  async getSlideImage() {
    this.slider = await this.mediaService.getList(this.event.photos);

    if (this.slider.length == 0)
      this.slider = [
        {
          src: "assets/imgs/fithawk-orange.png"
        }
      ];
  }

  more(myEvent) {
    let popover = this.popoverCtrl.create(MorePage, {
      data: 'event_' + this.pageKind
    });
    popover.present({
      ev: myEvent
    });
  }

  setRsvp() {
    let alert = this.alertCtrl.create({
      inputs: [
        {
          type: 'radio',
          label: 'GOING',
          value: '1'
        },
        {
          type: 'radio',
          label: 'NOT GOING',
          value: '3'
        },
        {
          type: 'radio',
          label: 'MAY BE',
          value: '2'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: (data) => {
            switch(data) {
              case '1':
                this.rsvpVal = 'GOING';
                break;
              case '3':
                this.rsvpVal = 'NOT GOING';
                break;
              case '2':
                this.rsvpVal = 'MAY BE';
                break;
            }

            this.eventService.setRsvpStatus(this.event.event_id, this.authService.user.uid, data);

            this.event = this.eventService.event_detail;
          }
        }
      ]
    });

    alert.present();
  }

  goToUploadPhoto() {
    this.navCtrl.push(UploadPhotoPage, {
      event_id: this.event.event_id
    });
  }

  goToMembersPage(members) {
    this.navCtrl.push(EventMemberPage, {
      event_name: this.event.title,
      members: members
    });
  }
  
  goToPhotoPage(photos) {
    this.navCtrl.push(PhotoListPage, {
      photos: photos,
      event_id: this.event.event_id
    });
  }

  extendDetail() {
    this.extendFlag = !this.extendFlag;

    if (this.extendFlag) {
      this.extendText = "[more]";
    } else {
      this.extendText = "[less]";
    }
  }

  goToCommentsPage(comments) {
    this.navCtrl.push(CommentListPage, {
      comments: comments,
      event_id: this.event.event_id
    });
  }

}
