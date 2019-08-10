import {Component, OnInit} from '@angular/core';
import {AuthLoginInfo} from '../../../services/auth/login-info';
import {LocalStorageService} from '../../../services/local-storage.service';
import {UserService} from '../../../services/user.service';
import {AuthService} from '../../../services/auth/auth.service';
import {Router} from '@angular/router';

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
  private loginInfo: AuthLoginInfo;

  constructor(
    private authService: AuthService,
    private storageService: LocalStorageService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (LocalStorageService.token) {
      this.isLoggedIn = true;
    }
  }

  onSubmit() {
    this.loginInfo = new AuthLoginInfo(
      LocalStorageService.username,
      this.form.password);


    this.authService.attemptAuth(this.loginInfo).subscribe(
      data => {
        console.log(data);
        LocalStorageService.token = data.accessToken;
        LocalStorageService.username = data.username;
        LocalStorageService.authorities = data.authorities;
        this.goToUserPage(data.username);


      }, error => {
        if (error.error.httpStatus === 'NOT_FOUND') {
          console.log('user not found');
          this.errorMessage = 'user not found';
          this.isLoginFailed = true;
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

  goToUserPage(username: string) {
    this.userService.getUserByUsername(username)
      .subscribe(value => this.router.navigate(['/id/' + value.id]), error => console.log(error));
  }

}
