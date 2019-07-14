import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from '../components/home/home.component';
import {UserComponent} from '../components/user/user.component';
import {PmComponent} from '../components/pm/pm.component';
import {AdminComponent} from '../components/admin/admin.component';
import {LoginComponent} from '../components/auth/login/login.component';
import {RegisterComponent} from '../components/auth/register/register.component';
import {UserHomeComponent} from '../components/user-home/user-home.component';
import {FriendsComponent} from '../components/friends/friends.component';
import {SignUpVerificationComponent} from '../components/auth/sign-up-verification/sign-up-verification.component';
import {AppComponent} from '../app.component';
import {PasswordResetComponent} from '../components/auth/password-reset/password-reset.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'user', component: UserComponent},
  { path: 'pm', component: PmComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'signin', component: LoginComponent},
  { path: 'signup', component: RegisterComponent},
  { path: 'verify', component: SignUpVerificationComponent},
  { path: 'reset-password', component: PasswordResetComponent},
  { path: 'friends', component: FriendsComponent},
  { path: '*', redirectTo: '', pathMatch: 'full'},
  { path: 'id/:id', component: UserHomeComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppRoutingModule { }
