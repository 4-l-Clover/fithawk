import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ToastController, Platform, AlertController, LoadingController, normalizeURL } from 'ionic-angular';
import { File, FileEntry } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from '@ionic-native/media-capture';

import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { MediaService } from '../../../services/media.service';
import { GroupService } from '../../../services/group.service';
import { UserLogService } from '../../../services/user_log.service';

import { AngularFirestore } from 'angularfire2/firestore';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { storage } from 'firebase';
import { containerRefreshEnd } from '@angular/core/src/render3/instructions';

@Component({
  selector: 'page-upload-media',
  templateUrl: 'upload-media.html',
})
export class UploadMediaPage {
  base64Image: string = '';
  videoUri: string = '';
  isImage = true;
  group_id = '';
  group_name = '';
  group_avatar = '';

  @ViewChild('player') v_player: ElementRef;

  public media: {title: string, detail: string};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private camera: Camera, 
    public actionSheetCtrl: ActionSheetController, 
    public toastCtrl: ToastController, 
    public platform: Platform,
    private dataService: DataService,
    private authService: AuthService,
    private mediaService: MediaService,
    private groupService: GroupService,
    public alertCtrl: AlertController,
    public firestore: AngularFirestore,
    public userLogService: UserLogService,
    public loadingCtrl: LoadingController,
    private mediaCapture: MediaCapture,
    private file : File
  ) {
    this.media = {title: '', detail: ''};
    this.base64Image = "assets/imgs/upload_image.png";

    this.group_id = navParams.get('group_id');
    this.group_name = navParams.get('group_name');
    this.group_avatar = navParams.get('group_avatar');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UploadMediaPage');
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

            if (this.isImage) {
              this.takePicture(this.camera.PictureSourceType.CAMERA);
            } else {
              this.captureVideo();
            }
            
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

  public captureVideo() {
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 30,
      quality: 50
    }
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      try {
        this.getBase64StringByFilePath("file:///" + res[0].fullPath);
      } catch (z) {
        this.presentToast('error occured');
      }
    },
      (err: CaptureError) => console.error(err));
  }

  public takePicture(sourceType) {
    if (this.isImage) {
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

    } else {
      var video_options = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        mediaType: this.camera.MediaType.VIDEO,
        sourceType:sourceType,
      }

      this.camera.getPicture(video_options).then((videoURI) => {
        var imageSRC = normalizeURL(videoURI);
        // this.videoUri = imageSRC;
        
        this.getBase64StringByFilePath(videoURI);

      }, (err) => {
        this.presentToast('Error while selecting video.');
      });
    }
  }

  getBase64StringByFilePath(fileURL): Promise<string> {
    return new Promise((resolve, reject) => {

        let fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1);
        let filePath = fileURL.substring(0, fileURL.lastIndexOf("/") + 1);
        this.file.readAsDataURL(filePath, fileName).then(
            file64 => {
              this.videoUri = file64;
              //this.videoUri = "data:video/mp4;base64," + videoURI;

              this.v_player.nativeElement.src = this.videoUri;
              this.v_player.nativeElement.load();
              this.v_player.nativeElement.play();

              resolve(file64);
            }).catch(err => {
                reject(err);
          });
    })
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  confirmAction() {
    let alert = this.alertCtrl.create({
      title: 'Do you want to upload image or video?',
      inputs: [
        {
          type: 'radio',
          label: 'IMAGE',
          value: '0'
        },
        {
          type: 'radio',
          label: 'VIDEO',
          value: '1'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: (data) => {

            if (data == 0)
              this.isImage = true;
            else
              this.isImage = false;

            this.presentActionSheet();
          }
        }
      ]
    });

    alert.present();
  }

  upload () {
    if (this.isImage) {

      if (this.base64Image.indexOf('upload_image') == -1) {
        this.uploadMedia(this.base64Image, 0);
      } else {
        this.presentToast('Please upload image file.');
      }
      
    } else {
      
      if (this.videoUri == '') {
        this.presentToast('Please upload video file.');
      } else {
        this.uploadMedia(this.videoUri, 1);
      }

    }
  }

  uploadMedia (baseString, flag) {
    const loading = this.loadingCtrl.create();

    let uploadTask = this.dataService.uploadToStorage(baseString);

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
              flag: flag,
              user_id: this.authService.user.uid,
              created_time: new Date().getTime()
            };
      
            this.mediaService.uploadMedia(saveData).then((res) => {

              this.mediaService.mediaList.push(saveData);
              this.groupService.updateGroupByMedia(this.group_id, res.id);

              var descStr = "added `" + this.media.title +  "` photo to group";

              if (flag == 1)
                descStr = "added `" + this.media.title +  "` video to group";

              var meta = {
                name: this.group_name,
                description: descStr
              }
              this.userLogService.registerUserLog(this.authService.user.uid, this.group_id, 3, meta, this.group_avatar);

              this.presentToast('Media is uploaded successfully.');

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
  }

}
