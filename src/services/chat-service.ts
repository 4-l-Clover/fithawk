import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { map } from 'rxjs/operators/map';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UserService } from './user.service';

export class ChatMessage {
  messageId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  toUserId: string;
  time: number | string;
  message: string;
  status: string;
}

export class UserInfo {
  id: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class ChatService {

  public extendedMsg = [];
  constructor(
    private http: HttpClient,
    private events: Events,
    public firestore: AngularFirestore,
    public userService: UserService
  ) {
  }

  getNewMsg() {
    this.firestore.collection("messages").ref.orderBy("time", "desc").limit(1).onSnapshot((snapshot) => {
      var data = [];

      snapshot.forEach(function(doc) {
        data.push(doc.data());
      });
      
      this.events.publish('chat:received', data);
    });
  }
  
  getNewGroupMsg(group_id) {

    this.firestore.collection("groups").doc(group_id).ref.onSnapshot((snapshot) => {
      
      const {messages} = snapshot.data();

      if (messages.length != 0)
        this.events.publish('chat:group', messages[messages.length - 1]);
      else
        this.events.publish('chat:group', null);

    })
  }

  getMsgList(thisUserId, thatUserId) {
    // const msgListUrl = './assets/mock/msg-list.json';
    // return this.http.get<any>(msgListUrl)
    // .pipe(map(response => response.array));

    var promise = new Promise((resolve, reject) => {
      this.firestore.collection("messages").ref.where("userId", "==", thisUserId).where("toUserId", "==", thatUserId).orderBy("time", "desc").limit(10).get().then((snapshot1) => {
          var msgTo = [];
          var msgFrom = [];
          var msgData = [];

          snapshot1.forEach(function(doc) {
            msgTo.push(doc.data());
          });
          
          if (msgTo.length != 0) {

            this.firestore.collection("messages").ref.where("toUserId", "==", thisUserId).where("userId", "==", thatUserId).orderBy("time", "desc").where("time", ">", msgTo[msgTo.length - 1].time).get().then((snapshot2) => {

              snapshot2.forEach(function(doc) {
                msgFrom.push(doc.data());
              });
  
              msgData = msgTo.concat(msgFrom);
  
              if(msgData.length != 0)
                msgData.sort((a, b) => parseInt(a.time) - parseInt(b.time));
    
              resolve(msgData);
            }).catch((err) => {
              reject(err);
            });

          } else {

            this.firestore.collection("messages").ref.where("toUserId", "==", thisUserId).where("userId", "==", thatUserId).orderBy("time", "desc").limit(10).get().then((snapshot2) => {

              snapshot2.forEach(function(doc) {
                msgFrom.push(doc.data());
              });
  
              msgData = msgFrom;
  
              if(msgData.length != 0)
                msgData.sort((a, b) => parseInt(a.time) - parseInt(b.time));
    
              resolve(msgData);
            }).catch((err) => {
              reject(err);
            });

          }
         

      }).catch((err) => {
        reject(err);
      })
    });

    return promise;
  }

  extendMsgList(thisUserId, thatUserId, timeLimit) {
    this.extendedMsg = [];

    var promise = new Promise((resolve, reject) => {
      this.firestore.collection("messages").ref.where("userId", "==", thisUserId).where("toUserId", "==", thatUserId).orderBy("time", "desc").where("time", "<", timeLimit).limit(10).get().then((snapshot1) => {
          var msgTo = [];
          var msgFrom = [];
          var msgData = [];

          snapshot1.forEach(function(doc) {
            msgTo.push(doc.data());
          });
          
          if (msgTo.length != 0) {

            this.firestore.collection("messages").ref.where("toUserId", "==", thisUserId).where("userId", "==", thatUserId).orderBy("time", "desc").where("time", "<", timeLimit).where("time", ">", msgTo[msgTo.length - 1].time).get().then((snapshot2) => {

              snapshot2.forEach(function(doc) {
                msgFrom.push(doc.data());
              });
  
              msgData = msgTo.concat(msgFrom);
  
              if (msgData.length != 0)
                msgData.sort((a, b) => parseInt(a.time) - parseInt(b.time));
              
              this.extendedMsg = msgData;
              resolve(msgData);
            }).catch((err) => {
              reject(err);
            });

          } else {

            this.firestore.collection("messages").ref.where("toUserId", "==", thisUserId).where("userId", "==", thatUserId).orderBy("time", "desc").where("time", "<", timeLimit).limit(10).get().then((snapshot2) => {

              snapshot2.forEach(function(doc) {
                msgFrom.push(doc.data());
              });
  
              msgData = msgFrom;

              if (msgData.length != 0)
                msgData.sort((a, b) => parseInt(a.time) - parseInt(b.time));
              
              this.extendedMsg = msgData;
              resolve(msgData);
            }).catch((err) => {
              reject(err);
            });

          }
      }).catch((err) => {
        reject(err);
      })
    });

    return promise;
  }

  upDateReadStatus(thisUserId, thatUserId) {
    this.firestore.collection("messages").ref.where("toUserId", "==", thisUserId).where("userId", "==", thatUserId).orderBy("time", "desc").limit(1).get().then((snapshot) => {

      if (snapshot.docs.length != 0 && !snapshot.docs[0].data().read)
        this.firestore.collection("messages").doc(snapshot.docs[0].id).update({read: true});
    });
  }

  sendMsg(msg) {
    msg.status = 'success';

    var promise = new Promise((resolve, reject) => {
      this.firestore.collection("messages").add(msg).then((snapshot) => {
        resolve('Saved Successfully.');
      }).catch((err) => {
        reject(err);
      })
    });

    return promise;
  }

  setUsersMessageRelation(userId, toUserId) {
    this.firestore.collection("users").doc(userId).ref.get().then((snapshot) => {
      const {message_relation} = snapshot.data();
      
      var filtered = message_relation.find(function(el) {
        return el == toUserId;
      });

      if (!filtered) {
        message_relation.push(toUserId);

        this.firestore.collection("users").doc(userId).update({message_relation: message_relation});
      }
    });

    this.firestore.collection("users").doc(toUserId).ref.get().then((snapshot) => {
      const {message_relation} = snapshot.data();

      var filtered = message_relation.find(function(el) {
        return el == userId;
      });

      if (!filtered) {
        message_relation.push(userId);

        this.firestore.collection("users").doc(toUserId).update({message_relation: message_relation});
      }
    });
  }

  async getMessangerList(userId) {
    var returnData = [];

    if (this.userService.message_relation.length != 0) {

      for (var i = 0; i < this.userService.message_relation.length; i ++) {
        var returnItem = {};
        var latestSendMsg: any;
        latestSendMsg = {time: 0};
        var latestReceiveMsg: any;
        latestReceiveMsg = {time: 0};

        returnItem['toUserName'] = this.userService.message_relation[i]['name'].toUpperCase();
        returnItem['toUserId'] = this.userService.message_relation[i]['uid'];
        returnItem['toUserAvatar'] = this.userService.message_relation[i]['avatar'];


        var snapshot1 = await this.firestore.collection("messages").ref.where("userId", "==", userId).where("toUserId", "==", this.userService.message_relation[i]['uid']).orderBy("time", "desc").limit(1).get();
        
        if (snapshot1.docs.length != 0)
          latestSendMsg = snapshot1.docs[0].data();


        var snapshot2 = await this.firestore.collection("messages").ref.where("userId", "==", this.userService.message_relation[i]['uid']).where("toUserId", "==", userId).orderBy("time", "desc").limit(1).get();

        if (snapshot2.docs.length != 0)
          latestReceiveMsg = snapshot2.docs[0].data();

        if ( latestSendMsg.time != 0 || latestReceiveMsg.time != 0) {

          if (latestSendMsg.time > latestReceiveMsg.time) {

            returnItem['message'] = latestSendMsg.message;
            returnItem['time'] = latestSendMsg.time;
            returnItem['read'] = true
  
          } else {
  
            returnItem['message'] = latestReceiveMsg.message;
            returnItem['time'] = latestReceiveMsg.time;
            returnItem['read'] = latestReceiveMsg.read;
  
          }

          returnData.push(returnItem);
        }
        
      }

      return returnData;

    }
  }

  async getUsersGroupMembers(user_id) {
    var memberIdList = [];

    var snapshot = await this.firestore.collection("groups").ref.where("owner", "==", user_id).get();
    
    snapshot.forEach(function(doc) {
      memberIdList = memberIdList.concat(doc.data().users);
    });

    var memberUniqueIdList = [];

    if (memberIdList.length != 0)
      memberUniqueIdList = (memberIdList).filter((v,i) => memberIdList.indexOf(v) === i)

    var memberDetailList = await this.userService.getUserList(memberUniqueIdList);

    return memberDetailList;
  }

  sendGroupMsg(msg, group_id) {
    msg.status = 'success';

    this.firestore.collection("groups").doc(group_id).ref.get().then((snapshot) => {
      const {messages} = snapshot.data();

      messages.push(msg);

      return this.firestore.collection("groups").doc(group_id).update({messages: messages});
    });
  }

}
