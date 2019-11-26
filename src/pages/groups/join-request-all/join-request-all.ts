import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../../services/user.service';
import { GroupService } from '../../../services/group.service';
import { UserLogService } from '../../../services/user_log.service';

@Component({
  selector: 'page-join-request-all',
  templateUrl: 'join-request-all.html',
})
export class JoinRequestAllPage {
  requestList: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService: UserService,
    public groupService: GroupService,
    public userLogService: UserLogService,
  ) {
      this.requestList = navParams.get('requestList');

      console.log('request list is ...', this.requestList);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JoinRequestAllPage');
  }

  declineJoinRequest(group_id, user_id, index) {
    this.groupService.declineRequest(group_id, user_id);

    this.removeJoinRequest(user_id, index);
  }

  async acceptJoinRequest(group_id, user_id, group_name, index) {
    this.groupService.acceptRequest(group_id, user_id);
    this.userService.addUserToGroup(user_id, group_id);
    
    var meta = {
      name: group_name,
      description: "joined"
    }

    var group = await this.groupService.getGroupById(group_id);

    this.userLogService.registerUserLog(user_id, group_id, 2, meta, group.avatar); 

    this.removeJoinRequest(user_id, index);
  }

  removeJoinRequest(user_id, index) {
    var filtered = this.requestList[index].pendding.filter(function(el){
      return el.uid != user_id;
    });
    
    this.requestList[index].pendding = filtered;

    if (this.requestList[index].pendding.length == 0) {
      this.requestList.splice(index, 1);
    }

  }

}
