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
  private domen = 'http://localhost:4200';
  private allowedURLs: string[] = [
    this.domen + '/signin',
    this.domen + '/signup',
    this.domen + '/verify'
  ];


  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.getUser();
    } else if (!this.allowedURLs.includes(window.location.href)) {
      window.location.href = '/signin';
    }
  }

  private getUser() {
    this.userService.getUserByUsername(this.tokenStorage.getUsername())
      .subscribe(value => this.loggedUser = value);
  }

  public logOut() {
    this.tokenStorage.signOut();
    window.location.href = '/signin';
  }

  setContentHeight(content): number {
    return window.innerHeight - content.offsetTop;
  }

  getTopPosition(element) {
    return element.getHeight();
  }

  getContentWidth() {
    return window.innerWidth - 280;
  }
}
