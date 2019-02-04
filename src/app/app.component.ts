import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from './services/auth/token-storage.service';
import {UserService} from './services/user.service';
import {User} from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loggedUser: User;
  private roles: string[];
  private authority: string;
  private domen = 'http://localhost:4200';
  private allowedURLs: string[] = [
    this.domen + '/signin',
    this.domen + '/signup',
    this.domen + '/verify'
  ];

  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.setAuthorities();
      this.getUser();
    } else if (!this.allowedURLs.includes(window.location.href)) {
      window.location.href = '/signin';
    }

  }

  private getUser() {
    this.userService.getUserByUsername(this.tokenStorage.getUsername())
      .subscribe(value => this.loggedUser = value);
  }

  private setAuthorities() {
    this.roles = this.tokenStorage.getAuthorities();
    this.roles.every(role => {
      if (role === 'ROLE_ADMIN') {
        this.authority = 'admin';
        return false;
      } else if (role === 'ROLE_PM') {
        this.authority = 'pm';
        return false;
      }
      this.authority = 'user';
      return true;
    });
  }

  public logOut() {
    this.tokenStorage.signOut();
    window.location.href = '/signin';
  }

  // ---

}
