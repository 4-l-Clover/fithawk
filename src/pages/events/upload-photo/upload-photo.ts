import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ToastController, Platform, LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { EventService } from '../../../services/event.service';
import { MediaService } from '../../../services/media.service';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';

import { AngularFirestore } from 'angularfire2/firestore';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { storage } from 'firebase';

@Component({
  selector: 'page-upload-photo',
  templateUrl: 'upload-photo.html',
})
export class UploadPhotoPage {

  base64Image: string = '';
  event_id = '';

  public media: {title: string, detail: string};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private camera: Camera, 
    public actionSheetCtrl: ActionSheetController, 
    public toastCtrl: ToastController, 
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public eventService: EventService,
    public mediaService: MediaService,
    public authService: AuthService,
    private dataService: DataService,
    public firestore: AngularFirestore, 
  ) {
    this.media = {title: '', detail: ''};
    this.base64Image = "assets/imgs/upload_image.png";

    this.event_id = navParams.get('event_id');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UploadPhotoPage');
  }

  public presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  public takePicture(sourceType) {
    var image_options = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType:sourceType,
    }

    this.camera.getPicture(image_options).then((imageData) => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  upload () {
    if (this.base64Image.indexOf('upload_image') == -1) {
      const loading = this.loadingCtrl.create();

      let uploadTask = this.dataService.uploadToStorage(this.base64Image);

        uploadTask.on(storage.TaskEvent.STATE_CHANGED,
          (snapshot: UploadTaskSnapshot) => {
            // this.editButtonStr = (Math.floor((snapshot.bytesTransferred /snapshot.totalBytes) * 100)).toString();
          },
          (error) => {
            console.log('error occured ...', error);
            loading.dismiss()
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
              if (uploadTask.snapshot.state) {
                var saveData = {
                  title: this.media.title,
                  description: this.media.detail,
                  src: downloadURL,
                  flag: 0,
                  user_id: this.authService.user.uid,
                  created_time: new Date().getTime()
                };
          
                this.mediaService.uploadMedia(saveData).then((res) => {

                  this.eventService.event_detail['photos'].push(res.id);
                  this.eventService.updateEventByPhoto(this.event_id, res.id);

                  this.presentToast('Photo is uploaded successfully.');

                  loading.dismiss();

                  this.navCtrl.pop();
                }).catch(() => {
                });
              }
            }).catch(err => {
    
            })
          }
        );

      loading.present();
      
    } else {
      this.presentToast('Please upload media file.');
    }
  }

}
