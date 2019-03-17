import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { UserComponent } from './user/user.component';
import {HttpClientModule} from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from './content/content.component';
import { LoginComponent } from './login/login.component';
import {FormsModule} from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { PmComponent } from './pm/pm.component';
import { AdminComponent } from './admin/admin.component';
import {AppRoutingModule} from './app-routing/app-routing.module';
import {httpInterceptorProviders} from './services/auth/auth-interceptor';
import { UserHomeComponent } from './user-home/user-home.component';
import {SignUpVerificationComponent} from './sign-up-verification/sign-up-verification.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatDatepickerModule, MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatNativeDateModule
} from '@angular/material';
import {FriendsComponent} from './friends/friends.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { UserSearchComponent } from './user-search/user-search.component';
import {ConversationsComponent} from './conversations/conversations.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ChatComponent } from './chat/chat.component';

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
  ],
  providers: [
    httpInterceptorProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
