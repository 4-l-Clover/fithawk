import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ToastController, Platform, Navbar, LoadingController} from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { GroupDetailPage } from '../group-detail/group-detail';
import { AuthService } from '../../../services/auth.service';
import { GroupService } from '../../../services/group.service';
import { CategoryService } from '../../../services/category.service';
import { UserLogService } from '../../../services/user_log.service';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { DataService } from '../../../services/data.service';

import { storage } from 'firebase';
import * as zipcodes from "zipcodes";

@Component({
  selector: 'page-create-group',
  templateUrl: 'create-group.html',
})
export class CreateGroupPage {
  @ViewChild(Navbar) navBar: Navbar;
  categories = Array();
  base64Image = 'assets/imgs/upload_image.png';
  flag = false;

  group = {name: '', zip: '', detail: '', category_id: ''};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private camera: Camera, 
    public actionSheetCtrl: ActionSheetController, 
    public toastCtrl: ToastController, 
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public authService: AuthService,
    public groupService: GroupService,
    public categoryService: CategoryService,
    public userLogService: UserLogService,
    private dataService: DataService
  ) {
    this.getCategoryInfo();
    // let elements = document.querySelectorAll(".tabbar");

    // if (elements != null) {
    //   Object.keys(elements).map((key) => {
    //     elements[key].style.display = 'none';
    //   });
    // }
  }

  ionViewWillEnter() {
    this.group = {name: '', zip: '', detail: '', category_id: ''};
    this.base64Image = "assets/imgs/upload_image.png";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateGroupPage');
    // this.navBar.backButtonClick = (e:UIEvent)=>{
      
    //   let elements = document.querySelectorAll(".tabbar");

    //   if (elements != null) {
    //     Object.keys(elements).map((key) => {
    //       if (elements[key].style.display == 'none') {
    //         elements[key].style.display = '';
    //       }
    //     });
    //   }
      
    //   this.navCtrl.pop();
    // }
  }

  async getCategoryInfo() {
    this.categories = await this.categoryService.getCategory();
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

  createGroup () {
    if(!zipcodes.lookup(this.group.zip))
      this.presentToast("Please Insert Correct Zip Code!");
    else {
      
      if (!this.flag) {
        this.presentToast("Please Insert Group Avatar!");
      } else {
        const loading = this.loadingCtrl.create();

        let uploadTask = this.dataService.uploadToStorage(this.base64Image);

        uploadTask.on(storage.TaskEvent.STATE_CHANGED,
          (snapshot: UploadTaskSnapshot) => {
            // this.editButtonStr = (Math.floor((snapshot.bytesTransferred /snapshot.totalBytes) * 100)).toString();
          },
          (error) => {
            console.log('error occured ...', error);
            loading.dismiss();
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
              if (uploadTask.snapshot.state) {
                var saveData = {
                  name: this.group.name,
                  owner: this.authService.user.uid,
                  avatar: downloadURL,
                  category_id: this.group.category_id,
                  zip: this.group.zip,
                  description: this.group.detail,
                  admin: [],
                  users: [],
                  pendding: [],
                  media: [],
                  events: [],
                  messages: [],
                  created_at: new Date().getTime()
                };
          
                this.groupService.addGroup(saveData).then((groupRes) => {

                  this.categoryService.updateCategoryByCreatingGroup(this.group.category_id, groupRes.id);
                  
                  var meta = {
                    name: this.group.name.toUpperCase(),
                    description: "created a group"
                  }
        
                  this.userLogService.registerUserLog(this.authService.user.uid, groupRes.id, 0, meta, saveData.avatar);
        
                  loading.dismiss().then(() => {
                    this.presentToast("New Group is Created Successfully!");
                    
                    this.navCtrl.push(GroupDetailPage, {
                      data: 'mine',
                      group_id: groupRes.id
                    });
                  });
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
  }
}
