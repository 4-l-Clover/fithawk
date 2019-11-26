import { Injectable, group } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { AngularFireAuth } from 'angularfire2/auth';
// import { Observable, from } from 'rxjs';
import * as firebase from 'firebase';
import { async } from 'rxjs/internal/scheduler/async';

import { UserService } from './user.service';
import { GroupService } from './group.service';
import { AuthService } from './auth.service';

@Injectable()
export class UserLogService {

    public group_check_list: any;

constructor(
    public firestore: AngularFirestore,
    public userService: UserService,
    public groupService: GroupService,
    public authService: AuthService
) {}

    registerUserLog(user_id, group_event_id, flag, meta, group_avatar) {
        var group_id = 0;
        var event_id = 0;

        if (flag == 4) {

            group_id = group_event_id.group_id;
            event_id = group_event_id.event_id;

        } else {

            group_id = group_event_id;

        }

        this.userService.getUser(user_id).then((res) => {
            var log = {
                user_id: user_id,
                user_name: res['name'].toUpperCase(),
                user_avatar: res['avatar'],
                flag: flag,
                group_event_id: group_id,
                event_id: event_id,
                meta: meta,
                group_avatar: group_avatar,
                read_users: [],
                created_at: new Date().getTime()
            }
            
            return this.firestore.collection("user_log").add(log); 
        });
    }

    getUserLog(user_id) {
        var promise = new Promise((resolve, reject) => {
            this.firestore.collection("user_log").ref.where("user_id", "==", user_id).orderBy("flag").where("flag", "<", 4).orderBy("created_at").limit(5).get().then((snapshot) => {
                var data = [];

                snapshot.forEach(function(doc) {
                    data.push(doc.data());
                });

                resolve(data);
            }).catch((err) => {
              reject(err);
            })
        });
    
        return promise;
    }

    async getNotification() {
            
        var snapshot = await this.firestore.collection("user_log").ref.orderBy("flag").where("flag", ">", 1).where("flag", "<", 5).orderBy("created_at").get();

        var data = [];
        
        for (var i = 0; i < snapshot.docs.length; i ++) {

            var userJoinedFlag = await this.groupService.checkUserJoinedGroup(snapshot.docs[i].data().group_event_id, this.authService.user.uid);

            if (userJoinedFlag) {

                var log = snapshot.docs[i].data();

                if (log.flag == 2) {

                    log.meta.description = log.user_name + " joined";
                    
                }
                
                data.push(log);

            }

        }

        return data;
    }

    async getPosts() {

        var snapshot = await this.firestore.collection("user_log").ref.orderBy("flag").where("flag", ">", 1).orderBy("created_at", "desc").get();

        var returnData = {};
        var posts = [];
        var notifications = [];

        for ( var i = 0 ; i < snapshot.docs.length; i ++) {

            if (snapshot.docs[i].data().flag == 5 || snapshot.docs[i].data().flag == 3) {

                var item = {};

                item['user_name'] = snapshot.docs[i].data().user_name;
                item['user_avatar'] = snapshot.docs[i].data().user_avatar;
                item['post'] = snapshot.docs[i].data().meta.description;
                item['group_event_id'] = snapshot.docs[i].data().group_event_id;
                item['created_at'] = new Date(snapshot.docs[i].data().created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});

                //if (snapshot.docs[i].data().created_at > todayStart)
                posts.push(item);

            } else {

                var log = {
                    created_at: snapshot.docs[i].data().created_at,
                    flag: snapshot.docs[i].data().flag,
                    group_avatar: snapshot.docs[i].data().group_avatar,
                    group_event_id: snapshot.docs[i].data().group_event_id,
                    event_id: snapshot.docs[i].data().event_id,
                    meta: snapshot.docs[i].data().meta,
                    read_users: snapshot.docs[i].data().read_users,
                    user_avatar: snapshot.docs[i].data().user_avatar,
                    user_id: snapshot.docs[i].data().user_id,
                    user_name: snapshot.docs[i].data().user_name,
                    user_log_id: snapshot.docs[i].id
                }

                if (log.flag == 2) {

                    log.meta.description = log.user_name + " joined";
                    
                }
                
                notifications.push(log);

            }

        }

        returnData['post'] = posts;
        returnData['notification'] = notifications;

        return returnData;
    }

    async getGroupPosts(group_id) {
        var posts = [];

        var snapshot = await this.firestore.collection("user_log").ref.where("group_event_id", "==", group_id).where("flag", "==", 5).orderBy('created_at').get();

        snapshot.docs.forEach(async (doc) => {
            var item = {};

            var snapshot1 = await this.firestore.collection("users").doc(doc.data()['user_id']).ref.get();

            item['user_name'] = snapshot1.data()['name'].toUpperCase();
            item['user_avatar'] = snapshot1.data()['avatar'];
            item['post_text'] = doc.data()['meta']['description'];
            item['created_at'] = doc.data()['created_at'];

            posts.push(item);
        });

        return posts;
    }

    async updateLogStatus(log) {
        var read_users = log.read_users;
        read_users.push(this.authService.user.uid);

        await this.firestore.collection("user_log").doc(log.user_log_id).update({read_users: read_users});
    }
}

// - flag :
//     0 - create a group,
//     1 - request to join
//     2 - joined to group
//     3 - add media to group
//     4 - create event
//     5 - create group post