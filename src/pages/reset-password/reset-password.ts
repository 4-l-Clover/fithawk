import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {LoginPage} from "../login/login";
import { emailValidator } from '../../services/validators'
import { RegisterPage } from '../register/register'

/**
 * Generated class for the ResetPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {

  resetForm: FormGroup;
  submitAttempt: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder) {
    this.resetForm = formBuilder.group({
      email: [null, Validators.compose([Validators.required, emailValidator])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  reset_pwd() {
    this.submitAttempt = true;

    if(this.resetForm.valid){
      this.navCtrl.setRoot(LoginPage);
    }
  }

  gotoSignup() {
    this.navCtrl.setRoot(RegisterPage);
  }

  gotoLogin() {
    this.navCtrl.setRoot(LoginPage);
  }

}
