import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireStorage } from 'angularfire2/storage';

export interface FileItem {
  name: string
}

@Injectable()
export class DataService {
  fileItem: Observable<FileItem>;
  upload: any;
  constructor(
    private storage: AngularFireStorage
  ) {}
 
  uploadToStorage(base64image, path?){
    let uniqkey = 'pic' + Math.floor(Math.random() * 1000000);

    var pathUrl = (path ? path:"avatars") + "/" + uniqkey;
    let storageRef = this.storage.storage.ref(pathUrl);

    return storageRef.putString(base64image, 'data_url');
  }
}
