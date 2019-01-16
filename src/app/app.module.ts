import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {UserComponent} from './user/user.component';
import {HttpClientModule} from '@angular/common/http';
import {HeaderComponent} from './header/header.component';
import {ContentComponent} from './content/content.component';
import {LoginComponent} from './login/login.component';
import {FormsModule} from '@angular/forms';
import {RegisterComponent} from './register/register.component';
import {HomeComponent} from './home/home.component';
import {PmComponent} from './pm/pm.component';
import {AdminComponent} from './admin/admin.component';
import {AppRoutingModule} from './app-routing/app-routing.module';
import {httpInterceptorProviders} from './services/auth/auth-interceptor';
import {UserHomeComponent} from './user-home/user-home.component';
import {MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { SignUpVerificationComponent } from './sign-up-verification/sign-up-verification.component';

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
    SignUpVerificationComponent
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
    MatInputModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
