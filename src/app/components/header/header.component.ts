import {Component, ElementRef, OnInit} from '@angular/core';
import {AuthLoginInfo} from '../../services/auth/login-info';
import {UserSearchModel} from '../user-search/UserSearchModel';
import {LocalStorageService} from '../../services/local-storage.service';
import {AuthService} from '../../services/auth/auth.service';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  roles: string[] = [];
  private loginInfo: AuthLoginInfo;
  form: any = {};
  searchInput = '';
  users: UserSearchModel[];

  constructor(
    private storageService: LocalStorageService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (this.storageService.token) {
      this.roles = this.storageService.authorities;
    }
  }

  onSubmit() {
    this.loginInfo = new AuthLoginInfo(
      this.form.username,
      this.form.password);

    this.authService.attemptAuth(this.loginInfo).subscribe(
      data => {
        this.goToUserPage(data.username);
        this.roles = this.storageService.authorities;
      }
    );
  }

  goToUserPage(username: string) {
    this.userService.getUserByUsername(username)
      .subscribe(value => this.router.navigate(['id/' + value.id]),
        error => console.log(error));
  }

  public logOut() {
    this.authService.logOut();
  }

  searchUser() {
    this.userService.findUser(this.searchInput).subscribe(data => {
      this.users = data;
    });
  }
}
