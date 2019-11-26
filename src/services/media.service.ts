import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class MediaService {

    public mediaList = [];

constructor(
    public firestore: AngularFirestore
) {}
    async getList(idList) {
        var returnData = [];

        for (var i = 0; i < idList.length; i ++) {
            var snapshot = await this.firestore.collection("media").doc(idList[i]).ref.get();

            var item = {
                id: snapshot.id,
                created_time: snapshot.data().created_time,
                description: snapshot.data().description,
                flag: snapshot.data().flag,
                src: snapshot.data().src,
                title: snapshot.data().title,
                user_id: snapshot.data().user_id
            }

            returnData.push(item);
        }

        return returnData;
    }

    deleteMedia(id) {
        return this.firestore.collection("media").doc(id).delete();
    }

    uploadMedia(media) {
        return this.firestore.collection("media").add(media);
    }
}