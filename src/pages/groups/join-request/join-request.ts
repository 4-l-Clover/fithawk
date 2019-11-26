import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../../services/user.service';
import { GroupService } from '../../../services/group.service';
import { UserLogService } from '../../../services/user_log.service';

@Component({
  selector: 'page-join-request',
  templateUrl: 'join-request.html',
})
export class JoinRequestPage {
  penddingIdList = [];
  penddingList = [];
  groupName = "";
  currentGroupId = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userService:UserService,
    public groupService:GroupService,
    public userLogService:UserLogService,
  ) {
    this.penddingIdList = navParams.get('pendding');
    this.groupName = navParams.get('name').toUpperCase();
    this.currentGroupId = navParams.get('id');

    this.getPenddingList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JoinRequestPage');
  }

  async getPenddingList() {
    var membersList = await this.userService.getUserList(this.penddingIdList);
    console.log('member list is...', membersList);
    //var membersList = await this.userService.getUserList(['FMUO07mSk0W8Broy2ABaZMMBQwv1', 'IumIN9sD05Npg28j6OSGOgZm0Jq1', 'UzII6fy7JNOrky0GkjWijxUKFRp1']);

    membersList.forEach(item => {
      this.penddingList.push({
        uid: item.uid,
        avatar: item.avatar,
        name: item.name.toUpperCase(),
        description: item.description
      });
    });
  }

  declineJoinRequest(user_id) {
    this.groupService.declineRequest(this.currentGroupId, user_id);

    this.removeJoinRequest(user_id);
  }

  async acceptJoinRequest(user_id) {
    this.groupService.acceptRequest(this.currentGroupId, user_id);
    this.userService.addUserToGroup(user_id, this.currentGroupId);
    
    var meta = {
      name: this.groupName,
      description: "joined"
    }

    var group = await this.groupService.getGroupById(this.currentGroupId);

    this.userLogService.registerUserLog(user_id, this.currentGroupId, 2, meta, group.avatar); 

    this.removeJoinRequest(user_id);
  }

  removeJoinRequest(user_id) {
    var filtered = this.penddingList.filter(function(el){
      return el.uid != user_id;
    });

    this.penddingList = filtered;
  }

}
