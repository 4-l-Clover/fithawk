import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { UserLogService } from '../../services/user_log.service';

@IonicPage()
@Component({
  selector: 'page-modal-page',
  templateUrl: 'modal-page.html',
})
export class ModalPage {
  groupList = [];
  allChecked = true;
  //checkList = [];

  constructor(
    private navParams: NavParams, 
    private view: ViewController,
    public userLogService: UserLogService
  ) {
    this.groupList = this.navParams.get('data');
    var that = this;

    //this.checkList = this.userLogService.group_check_list;

    Object.keys(this.userLogService.group_check_list).forEach(function(key) {

      if (!that.userLogService.group_check_list[key]) {
        that.allChecked = false;
      }

    });
  }

  selectAll() {
    this.allChecked = true;
    var that = this;
    
    Object.keys(this.userLogService.group_check_list).forEach(function(key) {

      that.userLogService.group_check_list[key] = true;
      
    });
  }

  unSelectAll() {
    this.allChecked = false;
    var that = this;

    Object.keys(this.userLogService.group_check_list).forEach(function(key) {

      that.userLogService.group_check_list[key] = false;
      
    });
  }

  selectOne(id) {
    this.userLogService.group_check_list[id] = true;

    var buf = true;
    var that = this;

    Object.keys(this.userLogService.group_check_list).forEach(function(key) {

      if (!that.userLogService.group_check_list[key])
        buf = false;
      
    });

    this.allChecked = buf;
  }
  
  unSelectOne(id) {
    this.userLogService.group_check_list[id] = false;

    this.allChecked = false;
  }
}