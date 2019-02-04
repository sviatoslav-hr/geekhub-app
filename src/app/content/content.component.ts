import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {UserService} from '../services/user.service';
import {User} from '../models/user';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  loggedUser: User;

  isLoggedIn = false;

  constructor(
    private authService: AuthenticationService,
    private tokenStorage: TokenStorageService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.getUser();
    }
  }

  private getUser() {
    this.userService.getUserByUsername(this.tokenStorage.getUsername())
      .subscribe(value => this.loggedUser = value);
  }

}
