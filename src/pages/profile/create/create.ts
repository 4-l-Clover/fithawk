import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ToastController, Platform, LoadingController} from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { AngularFirestore } from 'angularfire2/firestore';

import {ExploreGroupPage} from "../../explore/explore-group/explore-group";
import { CategoryService } from '../../../services/category.service';
import { UserService } from '../../../services/user.service';
import { DataService } from '../../../services/data.service';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';

import { storage } from 'firebase';
import * as zipcodes from "zipcodes";

@Component({
  selector: 'page-create',
  templateUrl: 'create.html',
})
export class CreateProfilePage {
  base64Image: string = '';
  categoryCheckFlag = {};
  // categoryCheckFlag = {
  //   'weighting': false,
  //   'yoga': false,
  //   'baseball': false,
  //   'swimming': false,
  //   'cross_fit': false,
  //   'running': false
  // };
  
  person = {name: '', zip: '', description: '', dob: ''};
  userId: any;
  categories: any;
  userCollection: any;
  flag = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private camera: Camera, 
    public actionSheetCtrl: ActionSheetController, 
    public toastCtrl: ToastController, 
    public platform: Platform, 
    public firestore: AngularFirestore, 
    public loadingCtrl: LoadingController,
    private userService: UserService,
    private categoryService: CategoryService,
    private dataService: DataService
  ) {
    this.base64Image = "assets/imgs/add.png";

    this.userId = navParams.get('userId');
    
    this.getCategoryInfo();
  }

  ionViewDidLoad() {
  }

  async getCategoryInfo() {
    this.categories = await this.categoryService.getCategory();

    this.categories.forEach(element => {
      this.categoryCheckFlag[element.id] = false;
    });
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
    var options = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType:sourceType,
    }

    this.camera.getPicture(options).then((imageData) => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.flag = true;
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

  public selectCategory(kind) {
    this.categoryCheckFlag[kind] = !this.categoryCheckFlag[kind];
  }

  public saveProfile() {

    if(!zipcodes.lookup(this.person.zip))
      this.presentToast("Please Insert Correct Zip Code!");
    else {
      const loading = this.loadingCtrl.create();
      if (!this.flag) {
        var saveData = {
          uid: this.userId,
          birthday: this.person.dob,
          name: this.person.name,
          zip: this.person.zip,
          description: this.person.description,
          avatar: "assets/imgs/user.png",
          groups: [],
          events: [],
          message_relation: [],
          created_at: new Date().getTime()
        };

        this.userService.addUser(saveData).then((res) => {
          loading.dismiss().then(() => {
            this.navCtrl.push(ExploreGroupPage, {
              categoryCheck: this.categoryCheckFlag
            });
          });
        }).catch(() => {
        });
      } else {
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
                  uid: this.userId,
                  birthday: this.person.dob,
                  name: this.person.name,
                  zip: this.person.zip,
                  description: this.person.description,
                  avatar: downloadURL,
                  groups: [],
                  events: [],
                  message_relation: [],
                  created_at: new Date().getTime()
                };
          
                this.userService.addUser(saveData).then((res) => {
                  loading.dismiss().then(() => {
                    this.navCtrl.push(ExploreGroupPage, {
                      categoryCheck: this.categoryCheckFlag
                    });
                  });
                }).catch(() => {
                });
              }
            }).catch(err => {
    
            })
          }
        );
      }

      loading.present();
    }
  }

}
