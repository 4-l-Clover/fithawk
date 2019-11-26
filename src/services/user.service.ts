import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { AngularFireAuth } from 'angularfire2/auth';
// import { Observable, from } from 'rxjs';
// import * as firebase from 'firebase/app';

@Injectable()
export class UserService {
    public message_relation: any;

constructor(public firestore: AngularFirestore) {}

    addUser(user) {
        return this.firestore.collection("users").doc(user.uid).set(user);
    }

    async getAsyncUser(id) {
        var snapshot = await this.firestore.collection("users").doc(id).ref.get();

        return snapshot.data();
    }

    getUser(id) {
        var promise = new Promise((resolve, reject) => {
            this.firestore.collection("users").doc(id).ref.get().then((snapshot) => {
              resolve(snapshot.data());
            }).catch((err) => {
              reject(err);
            })
        });

        return promise;
    }

    async getUserList(idList) {
        var returnData = [];

        for (var i = 0; i < idList.length; i ++) {
            var snapshot = await this.firestore.collection("users").doc(idList[i]).ref.get();

            returnData.push(snapshot.data());
        }

        return returnData;
    }

    addUserToGroup(user_id, group_id) {
        this.firestore.collection("users").doc(user_id).ref.get().then((snapshot) => {
            const {groups} = snapshot.data();

            groups.push(group_id);

            return this.firestore.collection("users").doc(user_id).update({groups: groups});
        });
    }

    addEventToList(user_id, event_id) {
        this.firestore.collection("users").doc(user_id).ref.get().then((snapshot) => {
            const {events} = snapshot.data();

            events.push(event_id);

            return this.firestore.collection("users").doc(user_id).update({events: events});
        });
    }

    setMessageRelation(user_id) {

        var promise = new Promise((resolve, reject) => {
            this.firestore.collection("users").doc(user_id).ref.get().then((snapshot) => {
                const {message_relation} = snapshot.data();

                var users = this.subFunction(message_relation);

                resolve(users);
            }).catch((err) => {
              reject(err);
            })
          });
      
        return promise;
    }

    async subFunction(message_relation) {
        var relation_users = await this.getUserList(message_relation);

        return relation_users;
    }

    updateUserProfile(data) {
        return this.firestore.collection("users").doc(data.uid).update({birthday: data.birthday, name: data.name, zip: data.zip, description: data.description, avatar: data.avatar});
    }
}