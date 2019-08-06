import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UserComponent } from './components/user/user.component';
import {HttpClientModule} from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { LoginComponent } from './components/auth/login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { PmComponent } from './components/pm/pm.component';
import { AdminComponent } from './components/admin/admin.component';
import {AppRoutingModule} from './modules/app-routing.module';
import {httpInterceptorProviders} from './services/auth/auth-interceptor';
import { UserHomeComponent } from './components/user-home/user-home.component';
import {SignUpVerificationComponent} from './components/auth/sign-up-verification/sign-up-verification.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatDatepickerModule, MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatNativeDateModule, MatProgressSpinnerModule
} from '@angular/material';
import {FriendsComponent} from './components/friends/friends.component';
import { PasswordResetComponent } from './components/auth/password-reset/password-reset.component';
import { UserSearchComponent } from './components/user-search/user-search.component';
import {ConversationsComponent} from './components/chat-components/conversations/conversations.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ChatComponent } from './components/chat-components/chat/chat.component';

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
    SignUpVerificationComponent,
    PasswordResetComponent,
    UserSearchComponent,
    FriendsComponent,
    ConversationsComponent,
    ChatComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    DragDropModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    httpInterceptorProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
