import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { UserLogService } from '../../../services/user_log.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'page-group-post',
  templateUrl: 'group-post.html',
})
export class GroupPostPage {
  posts = [];
  text = "";

  group_id = "";
  group_name = "";
  group_avatar = "";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userLogService: UserLogService,
    public authService: AuthService,
    public userService: UserService,
    public loadingCtrl: LoadingController
  ) {
    this.group_id = navParams.get('group_id');
    this.group_name = navParams.get('group_name');
    this.group_avatar = navParams.get('group_avatar');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupPostPage');
  }

  ionViewWillEnter() {
    this.getPosts();
  }

  async getPosts() {
    const loading = this.loadingCtrl.create();
    loading.present();

    this.posts = await this.userLogService.getGroupPosts(this.group_id);

    loading.dismiss();

    console.log('-------> post is ...', this.posts);
  }

  putPost() {
    var meta = {
      name: this.group_name,
      description: this.text
    }

    this.userLogService.registerUserLog(this.authService.user.uid, this.group_id, 5, meta, this.group_avatar);

    this.userService.getUser(this.authService.user.uid).then((res) => {
      this.posts.push({
        user_name: res['name'].toUpperCase(),
        user_avatar: res['avatar'],
        post_text: this.text,
        created_at: new Date().getTime()
      });

      this.text = "";
    });

  }

}
