import {Component} from "@angular/core";
import {NavController, AlertController, ToastController, MenuController, Platform, LoadingController} from "ionic-angular";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {TabsPage} from "../tabs/tabs";
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

import { emailValidator } from '../../services/validators'
import { VideoPlayer } from '@ionic-native/video-player';
import { CreateProfilePage } from '../profile/create/create';
import { RegisterPage } from '../register/register';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  loginForm: FormGroup;
  submitAttempt: boolean = false;

  constructor(public nav: NavController, 
    public forgotCtrl: AlertController, 
    public menu: MenuController, 
    public toastCtrl: ToastController, 
    public videoPlayer: VideoPlayer, 
    public platform: Platform, 
    public formBuilder: FormBuilder, 
    private auth: AuthService,
    public loadingCtrl: LoadingController,
    private userService: UserService
  ) {
    this.menu.swipeEnable(false);

    this.loginForm = formBuilder.group({
      email: [null, Validators.compose([Validators.required, emailValidator])],
      password: ['', Validators.required]
    });

    let elements = document.querySelectorAll(".tabbar");

    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = 'none';
      });
    }
    
  }

  ionViewWillLeave() {
  }

  ionViewWillEnter() {
  }

  ionViewDidEnter() {
  }
  // login and go to home page
  login() {
    this.submitAttempt = true;

    if(this.loginForm.valid){
      let data = this.loginForm.value;

      let credentials = {
        email: data.email,
        password: data.password
      };

      const loading = this.loadingCtrl.create();

      this.auth.signInWithUserAccount(credentials)
			.then(
				(user) => {
          this.userService.getUser(user.user.uid).then((res) => {
            loading.dismiss().then(() => {
              if (!res) {
                this.nav.setRoot(CreateProfilePage, {
                  userId: user.user.uid
                });
              } else {
                this.nav.setRoot(TabsPage);
              }
            });
          });
        },
				error => {
          loading.dismiss().then(() => {
            this.presentToast("Wrong email or password. Please try again later.");
          });
        }
      );
      
      loading.present();
    } 
  }

  goToSignUp() {
    this.nav.setRoot(RegisterPage);
  }

  loginWithFacebook() {
    const loading = this.loadingCtrl.create();

    this.auth.doFacebookLogin()
    .then((user) => {

      this.userService.getUser(user['user'].uid).then((res) => {

        loading.dismiss().then(() => {

          if (!res) {
            this.nav.setRoot(CreateProfilePage, {
              userId: user['user'].uid
            });
          } else {
            this.nav.setRoot(TabsPage);
          }

        });

      });

    }, (err) => {
      loading.dismiss();
      this.presentToast(err.message);
    });

    loading.present();
  }

  loginWithGoogle() {
    const loading = this.loadingCtrl.create();
    this.auth.signInWithGoogle()
    .then((user) => {
      this.userService.getUser(user['user'].uid).then((res) => {
        loading.dismiss().then(() => {
          if (!res) {
            this.nav.setRoot(CreateProfilePage, {
              userId: user['user'].uid
            });
          } else {
            this.nav.setRoot(TabsPage);
          }
        });
      });
    }, (err) => {
      loading.dismiss();
      this.presentToast(err.message);
    });

    loading.present();
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  forgotPass() {
    let forgot = this.forgotCtrl.create({
      title: 'Forgot Password?',
      message: "Enter you email address to send a reset link password.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email',
          type: 'email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: data => {
            console.log('Send clicked');
            let toast = this.toastCtrl.create({
              message: 'Email was sended successfully',
              duration: 3000,
              position: 'top',
              cssClass: 'dark-trans',
              closeButtonText: 'OK',
              showCloseButton: true
            });
            toast.present();
          }
        }
      ]
    });
    forgot.present();
  }

}
