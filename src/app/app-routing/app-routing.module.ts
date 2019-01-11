import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from '../home/home.component';
import {UserComponent} from '../user/user.component';
import {PmComponent} from '../pm/pm.component';
import {AdminComponent} from '../admin/admin.component';
import {LoginComponent} from '../login/login.component';
import {RegisterComponent} from '../register/register.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'user', component: UserComponent},
  { path: 'pm', component: PmComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'auth/login', component: LoginComponent},
  { path: 'signup', component: RegisterComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full'},
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
