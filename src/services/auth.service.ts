import { Injectable } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import AuthProvider = firebase.auth.AuthProvider;

@Injectable()
export class AuthService {
	public user: firebase.User;

	constructor(
		public afAuth: AngularFireAuth,
		public googlePlus: GooglePlus,
		public fb: Facebook,
		public platform: Platform
	) {
		afAuth.authState.subscribe(user => {
			this.user = user;
		});
	}

	signInWithUserAccount(credentials) {
		console.log('Sign in with email');
		return this.afAuth.auth.signInWithEmailAndPassword(credentials.email,
			 credentials.password);
	}

	signUp(credentials) {
		return this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
	}

	get authenticated(): boolean {
		return this.user !== null;
	}

	signOut(): Promise<void> {
		return this.afAuth.auth.signOut();
	}

	signInWithGoogle() {
		return new Promise((resolve, reject) => {
			if (this.platform.is('cordova')) {
			  this.googlePlus.login({
				'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
				'webClientId': '659514407527-mdeh0ue9p5747rqn11at8k4jq3sag74a.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
				'offline': true
			  }).then((response) => {
				const googleCredential = firebase.auth.GoogleAuthProvider.credential(response.idToken);
				firebase.auth().signInAndRetrieveDataWithCredential(googleCredential)
				.then((user) => {
				  resolve(user);
				});
			  },(err) => {
				reject(err);
			  });
			}
			else{
			  this.afAuth.auth
			  .signInWithPopup(new firebase.auth.GoogleAuthProvider())
			  .then((user) => {
				 resolve(user)
			  },(err) => {
			   reject(err);
			 })
			}
		});
	}

	doFacebookLogin(){
    return new Promise((resolve, reject) => {
      if (this.platform.is('cordova')) {
        //["public_profile"] is the array of permissions, you can add more if you need
        this.fb.login(["public_profile"])
        .then((response) => {
          const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
          firebase.auth().signInWithCredential(facebookCredential)
            .then(user => resolve(user));
        }, err => reject(err)
        );
      }
      else {
        this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then(result => {
          resolve(result)
        },(err) => {
          reject(err);
        })
      }
    })
	}

}