import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from '../home/home.component';
import {UserComponent} from '../user/user.component';
import {PmComponent} from '../pm/pm.component';
import {AdminComponent} from '../admin/admin.component';
import {LoginComponent} from '../login/login.component';
import {RegisterComponent} from '../register/register.component';
import {UserHomeComponent} from '../user-home/user-home.component';
import {FriendsComponent} from '../friends/friends.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'user', component: UserComponent},
  { path: 'pm', component: PmComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'signin', component: LoginComponent},
  { path: 'signup', component: RegisterComponent},
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
  exports: [RouterModule]
})
export class AppRoutingModule { }
