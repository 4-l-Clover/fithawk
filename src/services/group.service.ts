import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { AngularFireAuth } from 'angularfire2/auth';
// import { Observable, from } from 'rxjs';
import * as firebase from 'firebase/app';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import * as zipcodes from "zipcodes";
import { async } from 'rxjs/internal/scheduler/async';

@Injectable()
export class GroupService {
constructor(
    public firestore: AngularFirestore,
    public userService: UserService,
    public authService: AuthService
) {}

    async getGroupsPerCategory(category_id) {
        var groupList = [];

        var snapshot = await this.firestore.collection("groups").ref.where("category_id", "==", category_id).get();

        snapshot.docs.forEach(doc => {
            var item = {
                id: doc.id,
                data: doc.data()
            }

            groupList.push(item);
        });

        return groupList;
    }

    addGroup(group) {
        return this.firestore.collection("groups").add(group);
    }

    async getGroupById(group_id) {
        var snapshot = await this.firestore.collection("groups").doc(group_id).ref.get();

        return snapshot.data();
    }

    joinRequest(group_id, user_id) {
        this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
            const {pendding} = snapshot.data();

            pendding.push(user_id);

            return this.firestore.collection("groups").doc(group_id).update({pendding: pendding});
        });
    }

    acceptRequest(group_id, user_id) {
        this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
            const {pendding, users} = snapshot.data();

            var filtered = pendding.filter(function(el) {
                return el != user_id;
            });

            users.push(user_id);

            return this.firestore.collection("groups").doc(group_id).update({pendding: filtered, users: users});
        });
    }

    declineRequest(group_id, user_id) {
        this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
            const {pendding} = snapshot.data();

            var filtered = pendding.filter(function(el) {
                return el != user_id;
            });

            return this.firestore.collection("groups").doc(group_id).update({pendding: filtered});
        });
    }

    async getJoinRequestsAll(owner_id) {
        var groupList = [];

        var snapshot = await this.firestore.collection("groups").ref.where("owner", "==", owner_id).get();

        snapshot.docs.forEach(doc => {
            var item = {
                id: doc.id,
                data: doc.data()
            }

            groupList.push(item);
        });

        var sendData = {};
        sendData['num'] = 0;
        sendData['list'] = [];

        for(var i = 0; i < groupList.length; i ++) {
            if (groupList[i].data.pendding.length != 0) {
                var sendItem = {};

                sendItem['group_id'] = groupList[i].id;
                sendItem['group_name'] = groupList[i].data.name.toUpperCase();

                sendItem['pendding'] = await this.userService.getUserList(groupList[i].data.pendding);

                sendData['num'] += groupList[i].data.pendding.length;
                sendData['list'].push(sendItem);
            }
        }

        return sendData;
    }

    async getSentRequestsAll(user_id) {
        var groupList = [];

        var snapshot = await this.firestore.collection("groups").ref.get();

        snapshot.docs.forEach(doc => {
            var item = {
                id: doc.id,
                data: doc.data()
            }

            groupList.push(item);
        });

        var sendData = {};
        sendData['num'] = 0;
        sendData['list'] = [];

        for(var i = 0; i < groupList.length; i ++) {

            var found = groupList[i].data.pendding.find(function(el) {
                return el == user_id;
            });

            if (found) {
                var sendItem = {};

                sendItem['group_id'] = groupList[i].id;
                sendItem['group_name'] = groupList[i].data.name.toUpperCase();
                sendItem['group_description'] = groupList[i].data.description;
                sendItem['group_zip'] = zipcodes.lookup(groupList[i].data.zip).city + " " + zipcodes.lookup(groupList[i].data.zip).country;
                sendItem['group_src'] = groupList[i].data.avatar;

                sendData['num'] ++;
                sendData['list'].push(sendItem);
            }
        }

        return sendData;
    }

    async getOwnerGroup(owner_id) {
        var groupList = [];

        var snapshot = await this.firestore.collection("groups").ref.where("owner", "==", owner_id).get();

        snapshot.docs.forEach(doc => {
            var item = {
                id: doc.id,
                data: doc.data()
            }

            groupList.push(item);
        });

        return groupList;
    }

    async getUserJoinedGroup(user_id) {
        var groupList = [];

        var snapshot = await this.firestore.collection("groups").ref.get();

        snapshot.docs.forEach(doc => {
            var foundMe = doc.data().users.find(function(el) {
                return el == user_id;
            });

            if (foundMe) {
                var item = {
                    id: doc.id,
                    data: doc.data()
                }
                
                groupList.push(item);
            }

        });

        return groupList;
    }

    async checkUserJoinedGroup(group_id, user_id) {
        var snapshot = await this.firestore.collection("groups").doc(group_id).ref.get();

        var group = snapshot.data();

        if (group.owner == user_id) {
            return true;
        } else {

            var findUser = group.users.find(function (el) {
                return el == user_id;
            });

            if (findUser) {

                return true;

            } else {

                return false;

            }

        }
    }

    addEventToList(group_id, event_id) {
        this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
            const {events} = snapshot.data();

            events.push(event_id);

            return this.firestore.collection("groups").doc(group_id).update({events: events});
        });
    }

    updateGroupByMedia(group_id, media_id) {
        this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
            const {media} = snapshot.data();

            media.push(media_id);
            
            return this.firestore.collection("groups").doc(group_id).update({media: media});
        });
    }

    updateGroupByDeletedMedia(group_id, media_id) {
        this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
            const {media} = snapshot.data();

            var filter = media.filter(function (el) {
                return el != media_id;
            });
            
            return this.firestore.collection("groups").doc(group_id).update({media: filter});
        });
    }

    userLeaveGroup(user_id, group_id) {
        var promise = new Promise((resolve, reject) => {

            this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
                const {users} = snapshot.data();
    
                var filter = users.filter(function(el) {
                    return el != user_id;
                });
                
                this.firestore.collection("groups").doc(group_id).update({users: filter}).then(() => {

                    this.firestore.collection("users").doc(user_id).ref.get().then((snapshot1) => {
    
                        const {groups} = snapshot1.data();
        
                        var filter1 = groups.filter(function(el) {
                            return el != group_id;
                        });
                        
                        this.firestore.collection("users").doc(user_id).update({groups: filter1}).then(() => {
                            resolve('success');
                        }).catch((err) => {
                            reject(err);
                        })
        
                    });

                });
            });
        });

        return promise;
    }

    getMsgList(group_id) {
        var promise = new Promise((resolve, reject) => {

            this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {

                const {messages} = snapshot.data();

                resolve(messages);

            }).catch((err) => {

                reject(err);
                
            });
        });

        return promise;
    }

    async getAllGroups () {
        var returnData = [];

        var snapshot = await this.firestore.collection("groups").ref.get();

        for (var i = 0; i < snapshot.docs.length; i ++) {

            var item = {};

            //var userJoinedFlag = await this.checkUserJoinedGroup(snapshot.docs[i].id, this.authService.user.uid);

            var group = snapshot.docs[i].data();

            if (group.owner == this.authService.user.uid) {

                item['id'] = snapshot.docs[i].id;
                item['data'] = group;
                item['owner'] = true;

                returnData.push(item);

            } else {

                var that = this;

                var findUser = group.users.find(function (el) {
                    return el == that.authService.user.uid;
                });

                if (findUser) {

                    item['id'] = snapshot.docs[i].id;
                    item['data'] = group;
                    item['owner'] = false;

                    returnData.push(item);

                }

            }

        }

        return returnData;
    }
}