import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { AngularFireAuth } from 'angularfire2/auth';
// import { Observable, from } from 'rxjs';
import * as firebase from 'firebase/app';

@Injectable()
export class CategoryService {
constructor(public firestore: AngularFirestore) {}

    async getCategory() {
        var categoryList = [];

        var snapshot = await this.firestore.collection("categories").ref.get();

        snapshot.docs.forEach(doc => {
            var item = {
                id: doc.id,
                data: doc.data()
            }

            categoryList.push(item);
        });

        return categoryList;
    }

    updateCategoryByCreatingGroup(category_id, group_id) {
        this.firestore.collection("categories").doc(category_id).ref.get().then((snapshot) => {
            const {groups} = snapshot.data();

            groups.push(group_id);

            return this.firestore.collection("categories").doc(category_id).update({groups: groups});
        });
    }
}