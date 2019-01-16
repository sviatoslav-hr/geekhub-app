import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  info: any;
  usersList: User[];

  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.info = {
      token: this.tokenStorage.getToken(),
      username: this.tokenStorage.getUsername(),
      authorities: this.tokenStorage.getAuthorities()
    };
    this.userService.getAllUsers()
      .subscribe(users => this.usersList = users, error => console.log(error));
  }

  logout() {
    this.tokenStorage.signOut();
    window.location.reload();
  }
}