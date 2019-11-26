import { Component, } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ToastController, Platform, LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {LoginPage} from "../login/login";
import { CreateProfilePage } from "../profile/create/create";
import { emailValidator, checkValidator, MatchPassword } from '../../services/validators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  registerForm: FormGroup;
  base64Image: string = '';
  submitAttempt: boolean = false;
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public formBuilder: FormBuilder, 
    private camera: Camera, 
    public actionSheetCtrl: ActionSheetController, 
    public toastCtrl: ToastController, 
    public platform: Platform, 
    private auth: AuthService,
    public loadingCtrl: LoadingController,
  ) {
    this.registerForm = formBuilder.group({
      confirm: [null, Validators.compose([Validators.required])],
      email: [null, Validators.compose([Validators.required, emailValidator])],
      password: ['', Validators.required],
      termsAccepted: ['false', Validators.compose([Validators.required, checkValidator])]
    }, {
      validator: MatchPassword // Inject the provider method
    });

    this.base64Image = "assets/imgs/add_image.png";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
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

  signup() {
    this.submitAttempt = true;

    if(this.registerForm.valid){

      let data = this.registerForm.value;

      let credentials = {
        email: data.email,
        password: data.password
      };

      const loading = this.loadingCtrl.create();
      
      this.auth.signUp(credentials).then(
        (data) => {
          loading.dismiss().then(() => {
            this.presentToast("Sign Up Successfully!");

            this.navCtrl.setRoot(CreateProfilePage, {
              userId: data.user.uid
            });
          });
        },
        error => {
          loading.dismiss().then(() => {
            this.presentToast(error.message);
          });
        }
      );

      loading.present();

    }
  }

  login() {
    this.navCtrl.setRoot(LoginPage);
  }

  goToTerms() {
    console.log("go to terms page ========>");
  }

}
