import {Component, OnInit} from '@angular/core';
import {User} from '../../models/user';
import {LocalStorageService} from '../../services/local-storage.service';
import {UserService} from '../../services/user.service';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  usersEnabled = false;
  usersList: User[];

  constructor(
    private storageService: LocalStorageService,
    private userService: UserService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    if (this.authService.isLogged) {
      this.getUsers();
    }
  }

  getUsers() {
    this.usersEnabled = true;
    this.userService.getAllUsers()
      .subscribe(users => this.usersList = users, error => console.log(error));
  }

  isLoggedIn(): boolean {
    return this.authService.isLogged;
  }
}
