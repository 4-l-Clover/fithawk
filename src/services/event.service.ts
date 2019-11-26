import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class EventService {

    public event_detail = {};
    public event_list = [];

constructor(
    public firestore: AngularFirestore
) {}
    addEvent(event) {
        return this.firestore.collection("events").add(event);
    }

    async getEventById(event_id) {
        var snapshot = await this.firestore.collection("events").doc(event_id).ref.get();

        return snapshot.data();
    }

    async getEventsPerGroup(group_id) {
        var eventList = [];

        var snapshot = await this.firestore.collection("events").ref.where("group_id", "==", group_id).get();

        snapshot.docs.forEach(doc => {
            var item = {
                id: doc.id,
                data: doc.data()
            }

            eventList.push(item);
        });

        return eventList;
    }

    setRsvpStatus(event_id, user_id, rsvp) {

        this.firestore.collection("events").doc(event_id).ref.get().then((snapshot) => {
            const {members} = snapshot.data();

            var userStatus = members.find(function (el) {
                return el.user_id == user_id
            });

            userStatus.rsvp_status = rsvp;

            var filter = members.filter(function (el) {
                return el.user_id != user_id;
            });

            filter.push(userStatus);

            
            return this.firestore.collection("events").doc(event_id).update({members: filter});
        });

        var found = this.event_detail['going'].find(function (el) {
            return el == user_id;
        });

        if (rsvp == 1) {
            if (!found) {

                this.event_detail['going'].push(user_id);

            }
        } else {
            if (found) {

                var filter = this.event_detail['going'].filter(function (el) {
                    return el != found;
                });

                this.event_detail['going'] = filter;
                
            }
        }
    }

    addComment(event_id, comment) {
        this.firestore.collection("events").doc(event_id).ref.get().then((snapshot) => {
            const {comments} = snapshot.data();

            comments.push(comment);
            
            return this.firestore.collection("events").doc(event_id).update({comments: comments});
        });
    }

    updateEventByPhoto(event_id, photo_id) {
        this.firestore.collection("events").doc(event_id).ref.get().then((snapshot) => {
            const {photos} = snapshot.data();

            photos.push(photo_id);
            
            return this.firestore.collection("events").doc(event_id).update({photos: photos});
        });
    }

    async getEventsPerUser(user_id) {
        var eventList = [];

        var snapshot = await this.firestore.collection("events").ref.where("user_id", "==", user_id).get();

        snapshot.docs.forEach(doc => {
            var item = {
                id: doc.id,
                data: doc.data()
            }

            eventList.push(item);
        });

        var snapshot1 = await this.firestore.collection("users").doc(user_id).ref.get();
        var groups = snapshot1.data().groups;

        for (var i = 1; i < groups.length; i ++) {

            var snapshot3 = await this.firestore.collection("events").ref.where("group_id", "==", groups[i]).get();

            snapshot3.docs.forEach(doc3 => {
                var item = {
                    id: doc3.id,
                    data: doc3.data()
                }
    
                eventList.push(item);
            });

        }

        console.log('event list is ...', eventList);

        return eventList;
    }

    updateEvent(event_id, event) {
        var promise = new Promise((resolve, reject) => {
            
            this.firestore.collection("events").doc(event_id).update(event).then(() => {
                resolve('success');
            }).catch((err) => {
                reject(err);
            });

        });

        return promise;
    }
}