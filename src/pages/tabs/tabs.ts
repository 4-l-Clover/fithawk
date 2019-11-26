import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
import {PostPage} from "../activity/post/post";
import {FithawkPage} from "../fithawk/fithawk";
import {OverviewPage} from "../profile/overview/overview";
import {MessageListPage} from "../messages/message-list/message-list";
import {CalendarItemPage} from "../calendar/calendar-item/calendar-item";

import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: 'tabs.html',
})
export class TabsPage {
  data_5: any;
  tab1Root = PostPage;
  tab2Root = CalendarItemPage;
  tab3Root = FithawkPage;
  tab4Root = MessageListPage;
  tab5Root = OverviewPage;

  constructor(
    public viewCtrl: ViewController, 
    public params: NavParams,
    public authService: AuthService
  ) {
    this.data_5 = {
      data: 'own',
      user_id: this.authService.user.uid
    };
  }

}
