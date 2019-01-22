import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UserComponent } from './user/user.component';
import {HttpClientModule} from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from './content/content.component';
import { LoginComponent } from './login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { PmComponent } from './pm/pm.component';
import { AdminComponent } from './admin/admin.component';
import {AppRoutingModule} from './app-routing/app-routing.module';
import {httpInterceptorProviders} from './services/auth/auth-interceptor';
import { UserHomeComponent } from './user-home/user-home.component';
import { FriendsComponent } from './friends/friends.component';
import { ConversationsComponent } from './conversations/conversations.component';
import {WebsocketModule} from './websocket/websocket.module';
import {environment} from '../environments/environment';
import { WsTestComponent } from './ws-test/ws-test.component';

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    HeaderComponent,
    ContentComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    PmComponent,
    AdminComponent,
    UserHomeComponent,
    FriendsComponent,
    ConversationsComponent,
    WsTestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    WebsocketModule.config({url: 'ws://localhost:4200'})
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
