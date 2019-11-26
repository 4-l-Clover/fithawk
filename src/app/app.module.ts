import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { Camera } from '@ionic-native/camera';
import { VideoPlayer } from '@ionic-native/video-player';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { MediaCapture } from '@ionic-native/media-capture';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { MyApp } from './app.component';

//integrate with firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreModule, FirestoreSettingsToken } from 'angularfire2/firestore';
import { AngularFireStorageModule} from 'angularfire2/storage';
import { firebaseConfig } from '../config';

//services
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { GroupService } from '../services/group.service';
import { CategoryService } from '../services/category.service';
import { UserLogService } from '../services/user_log.service';
import { DataService } from '../services/data.service';
import { EventService } from '../services/event.service';
import { MediaService } from '../services/media.service';

// pages
import { HomePage } from '../pages/home/home';
import {LoginPage} from "../pages/login/login";
import { RegisterPage } from '../pages/register/register';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { CreateProfilePage } from '../pages/profile/create/create';
import { OverviewPage } from '../pages/profile/overview/overview';
import { MinePage } from '../pages/groups/mine/mine';
import { OtherGroupPage } from '../pages/groups/other-group/other-group';
import { PostPage } from '../pages/activity/post/post';
import { FeedPage } from '../pages/activity/feed/feed';
import { TabsPage } from '../pages/tabs/tabs';
import { GroupDetailPage } from '../pages/groups/group-detail/group-detail';
import { ExploreCategoryPage } from '../pages/explore/explore-category/explore-category';
import { ExploreGroupPage } from '../pages/explore/explore-group/explore-group';
import { DiscoverPage } from '../pages/discover/discover';
import { CreateGroupPage } from '../pages/groups/create-group/create-group';
import { MorePage } from '../pages/more/more';
import { UploadMediaPage } from '../pages/groups/upload-media/upload-media';
import { EventListPage } from '../pages/events/event-list/event-list';
import { EventCreatePage } from '../pages/events/event-create/event-create';
import { EventDetailPage } from '../pages/events/event-detail/event-detail';
import { EventMemberPage } from '../pages/events/event-member/event-member';
import { UploadPhotoPage } from '../pages/events/upload-photo/upload-photo';
import { PhotoListPage } from '../pages/events/photo-list/photo-list';
import { PhotoDetailPage } from '../pages/events/photo-detail/photo-detail';
import { CommentListPage } from '../pages/events/comment-list/comment-list';
import { MediaListPage } from '../pages/groups/media-list/media-list';
import { MediaDetailPage } from '../pages/groups/media-detail/media-detail';
import { GroupMemberPage } from '../pages/groups/group-member/group-member';
import { MessageListPage } from '../pages/messages/message-list/message-list';
import { ComposePage } from '../pages/messages/compose/compose';
import { Chat } from '../pages/messages/chat/chat';
import { JoinRequestAllPage } from '../pages/groups/join-request-all/join-request-all';
import { DiscoverGroupPage } from '../pages/groups/discover-group/discover-group';
import { JoinRequestPage } from '../pages/groups/join-request/join-request';
import { RequestSentPage } from '../pages/groups/request-sent/request-sent';
import { CalendarEventsPage } from '../pages/calendar/calendar-events/calendar-events';
import { CalendarItemPage } from '../pages/calendar/calendar-item/calendar-item';
import { EditProfilePage } from '../pages/profile/edit-profile/edit-profile';
import { GroupListPage } from '../pages/messages/group-list/group-list';
import { GroupChatPage } from '../pages/messages/group-chat/group-chat';
import { GroupPostPage } from '../pages/groups/group-post/group-post';
import { FithawkPage } from '../pages/fithawk/fithawk';

//chat providers
import { ChatService } from "../services/chat-service";
import { RelativeTime } from "../services/relative-time";
import { EmojiPickerComponentModule } from "../components/emoji-picker/emoji-picker.module";
import { EmojiProvider } from "../services/emoji";

// componenents
import { AccordionComponent } from '../components/accordion/accordion';
import { TimelineComponent } from '../components/timeline/timeline';
import { TimelineTimeComponent } from '../components/timeline/timeline';
import { TimelineItemComponent } from '../components/timeline/timeline';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    FithawkPage,
    CreateProfilePage,
    OverviewPage,
    ResetPasswordPage,
    AccordionComponent,
    MinePage,
    OtherGroupPage,
    PostPage,
    FeedPage,
    TabsPage,
    GroupDetailPage,
    ExploreCategoryPage,
    ExploreGroupPage,
    DiscoverPage,
    CreateGroupPage,
    MorePage,
    UploadMediaPage,
    EventListPage,
    EventCreatePage,
    EventDetailPage,
    EventMemberPage,
    UploadPhotoPage,
    PhotoListPage,
    PhotoDetailPage,
    CommentListPage,
    MediaListPage,
    MediaDetailPage,
    GroupMemberPage,
    MessageListPage,
    ComposePage,
    Chat,
    RelativeTime,
    JoinRequestAllPage,
    DiscoverGroupPage,
    JoinRequestPage,
    RequestSentPage,
    CalendarEventsPage,
    CalendarItemPage,
    EditProfilePage,
    GroupListPage,
    GroupChatPage,
    GroupPostPage,
    TimelineComponent,
    TimelineTimeComponent,  
    TimelineItemComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    EmojiPickerComponentModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false,
      tabsHideOnSubPages:false,
      swipeBackEnabled: true
    }),
    AngularFireModule.initializeApp(firebaseConfig.fire),
    AngularFirestoreModule,
    AngularFireStorageModule,
    IonicStorageModule.forRoot({
      name: '__ionic3_start_theme',
        driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    FithawkPage,
    CreateProfilePage,
    OverviewPage,
    ResetPasswordPage,
    MinePage,
    OtherGroupPage,
    PostPage,
    FeedPage,
    TabsPage,
    GroupDetailPage,
    ExploreCategoryPage,
    ExploreGroupPage,
    DiscoverPage,
    CreateGroupPage,
    MorePage,
    UploadMediaPage,
    EventListPage,
    EventCreatePage,
    EventDetailPage,
    EventMemberPage,
    UploadPhotoPage,
    PhotoListPage,
    PhotoDetailPage,
    CommentListPage,
    MediaListPage,
    MediaDetailPage,
    GroupMemberPage,
    MessageListPage,
    ComposePage,
    Chat,
    JoinRequestAllPage,
    DiscoverGroupPage,
    JoinRequestPage,
    RequestSentPage,
    CalendarEventsPage,
    CalendarItemPage,
    EditProfilePage,
    GroupListPage,
    GroupChatPage,
    GroupPostPage
  ],
  providers: [
    ChatService,
    EmojiProvider,
    VideoPlayer,
    StatusBar,
    SplashScreen,
    Camera,
    FilePath,
    File,
    WebView,
    MediaCapture,
    AngularFireAuth,
    AuthService,
    UserService,
    GroupService,
    CategoryService,
    UserLogService,
    DataService,
    EventService,
    MediaService,
    GooglePlus,
    Facebook,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: FirestoreSettingsToken, useValue: {} }
  ]
})
export class AppModule {}

