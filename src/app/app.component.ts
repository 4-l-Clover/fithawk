import { Component, ViewChild } from "@angular/core";
import { Platform, Nav } from "ionic-angular";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
//import { Keyboard } from '@ionic-native/keyboard';

import { HomePage } from "../pages/home/home";
import { CreateProfilePage } from "../pages/profile/create/create";
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { TabsPage } from '../pages/tabs/tabs';

export interface MenuItem {
    title: string;
    component: any;
    icon: string;
}

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  //rootPage: any = HomePage;
  rootPage: any;

  appMenuItems: Array<MenuItem>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private auth: AuthService,
    private userService: UserService,
  ) {
    this.initializeApp();

    this.appMenuItems = [
      {title: 'Home', component: HomePage, icon: 'home'}
    ];
  }

  initializeApp() {

    var isFirstLaunch = true;
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.

      //*** Control Splash Screen
      // this.splashScreen.show();
      // this.splashScreen.hide();

      //*** Control Status Bar
      //this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#ffffff');

      //this.splashScreen.hide();
      setTimeout(() => {
        this.splashScreen.hide();
      }, 2500);
      //*** Control Keyboard
      //this.keyboard.disableScroll(true);
    });

    this.auth.afAuth.authState
    .subscribe(
      user => {
        if (isFirstLaunch) {
          if (user) {
            
            this.userService.getUser(user.uid).then((res) => {
              if (!res) {
                this.nav.setRoot(CreateProfilePage, {
                  userId: user.uid
                });
              } else {
                this.rootPage = TabsPage;
              }
            });

          } else {
            this.rootPage = HomePage;
          }
        }
        isFirstLaunch = false;
      },
      () => {
        isFirstLaunch = false;
        this.rootPage = HomePage;
      }
    );
  }

}
