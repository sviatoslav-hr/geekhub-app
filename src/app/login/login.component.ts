import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {AuthService} from '../services/auth/auth.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {AuthLoginInfo} from '../services/auth/login-info';
import {log} from 'util';
import {UserService} from '../services/user.service';
import {JwtResponse} from '../services/auth/jwt-response';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {};
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  private loginInfo: AuthLoginInfo;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
      private userService: UserService
  ) {
  }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getAuthorities();
    }
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


      }, error => {
        console.log(error);
        console.log(error.error.httpStatus);
        if (error.error.httpStatus === 'NOT_FOUND') {
          console.log('user not found');
          this.errorMessage = 'user not found';
          this.isLoginFailed = true;
        }
        if (error.error.httpStatus === 'LOCKED') {
          console.log('User is not activated');
          this.errorMessage = 'user is not activated';
          this.isLoginFailed = true;
          console.log(this.form.username);
          this.tokenStorage.saveUsername(this.form.username);
          window.location.href = '/verify';
        }
        if (error.error.httpStatus === 'UNAUTHORIZED') {
          console.log('Password is incorrect');
          this.errorMessage = 'Password is incorrect';
          this.isLoginFailed = true;
        }
        // this.errorMessage = error.error.message;
        this.isLoginFailed = true;
      }
    );
  }

  reloadPage() {
    window.location.reload();
  }

  goToUserPage(username: string) {
    this.userService.getUserByUsername(username)
      .subscribe(value => window.location.href = 'id/' + value.id, error => console.log(error));
  }

}
