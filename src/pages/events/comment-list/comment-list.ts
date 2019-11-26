import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'page-comment-list',
  templateUrl: 'comment-list.html',
})
export class CommentListPage {
  comments = [];
  event_id = "";
  text = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public eventService: EventService,
    public authService: AuthService,
    public userService: UserService,
    public loadingCtrl: LoadingController
  ) {
    this.comments = navParams.get('comments');
    this.event_id = navParams.get('event_id');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CommentListPage');
  }

  postComment() {
    this.userService.getUser(this.authService.user.uid).then((res) => {
      this.comments.push({
        user_name: res['name'].toUpperCase(),
        avatar: res['avatar'],
        comment: this.text,
        created_time: new Date().getTime()
      });

      this.eventService.addComment(this.event_id, {
        user_name: res['name'].toUpperCase(),
        avatar: res['avatar'],
        comment: this.text,
        created_time: new Date().getTime()
      });

      this.text = "";
    });
  }

}
