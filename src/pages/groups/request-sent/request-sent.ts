import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../../services/user.service';
import { GroupService } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'page-request-sent',
  templateUrl: 'request-sent.html',
})
export class RequestSentPage {
  requestList: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService: UserService,
    public groupService: GroupService,
    public authService: AuthService,
  ) {
    this.requestList = navParams.get('sentList');

    console.log('request list is ...', this.requestList);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RequestSentPage');
  }

  declineJoinRequest(group_id) {
    this.groupService.declineRequest(group_id, this.authService.user.uid);

    this.removeJoinRequest(group_id);
  }

  removeJoinRequest(group_id) {
    var filtered = this.requestList.filter(function(el){
      return el.group_id != group_id;
    });

    this.requestList = filtered;
  }

}
