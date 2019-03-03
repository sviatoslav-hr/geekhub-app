import {Component, ElementRef, OnInit} from '@angular/core';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {AuthService} from '../services/auth/auth.service';
import {AuthLoginInfo} from '../services/auth/login-info';
import {UserService} from '../services/user.service';
import {UserSearchModel} from '../user-search/UserSearchModel';
import {User} from '../models/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  roles: string[] = [];
  private loginInfo: AuthLoginInfo;
  isLoggedIn = false;
  form: any = {};
  searchInput = '';
  users: UserSearchModel[];
  username = this.tokenStorage.getUsername();
  loggedUser: User = null;

  constructor(
    private tokenStorage: TokenStorageService,
    private authService: AuthService,
    private userService: UserService,
    private el: ElementRef
  ) {
  }

  // ngOnInit() {
  //   this.isLoggedIn = !!!!!!!!!!!!!!!!this.tokenStorage.getToken();
  //   if (this.tokenStorage.getToken()) {
  //     this.isLoggedIn = true;
  //     this.roles = this.tokenStorage.getAuthorities();
  //   }
  // }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.getLoggedUser();
      this.roles = this.tokenStorage.getAuthorities();
    }
  }
  getLoggedUser() {
    const username = this.tokenStorage.getUsername();
    this.userService.getUserByUsername(username)
      .subscribe(value => {
        this.loggedUser = value;
      }, error => console.log(error));
  }

  onSubmit() {
    this.loginInfo = new AuthLoginInfo(
      this.form.username,
      this.form.password);


    this.authService.attemptAuth(this.loginInfo).subscribe(
      data => {
        console.log(data);
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUsername(data.username);
        this.tokenStorage.saveAuthorities(data.authorities);
        this.goToUserPage(data.username);
        this.roles = this.tokenStorage.getAuthorities();
      }
    );
  }

  goToUserPage(username: string) {
    this.userService.getUserByUsername(username)
      .subscribe(value => window.location.href = 'id/' + value.id, error => console.log(error));
  }

  public logOut() {
    this.tokenStorage.signOut();
    window.location.href = '/signin';
  }

  searchUser() {
    console.log(this.searchInput);

    this.userService.findUser(this.searchInput).subscribe(data => {
      this.users = data;
      console.log(this.users);
    });
  }

  getHeight() {
    return this.el.nativeElement.children[0].offsetHeight;
  }
}
