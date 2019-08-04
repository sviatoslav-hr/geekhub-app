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
  roles: string[] = [];
  private loginInfo: AuthLoginInfo;

  constructor(
    private authService: AuthService,
    private storageService: LocalStorageService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (this.storageService.token) {
      this.isLoggedIn = true;
      this.roles = this.storageService.authorities;
    }
  }

  onSubmit() {
    this.loginInfo = new AuthLoginInfo(
      this.form.username,
      this.form.password);


    this.authService.attemptAuth(this.loginInfo).subscribe(
      data => {
        console.log(data);
        this.storageService.token = data.accessToken;
        this.storageService.username = data.username;
        this.storageService.authorities = data.authorities;
        this.goToUserPage(data.username);
        this.roles = this.storageService.authorities;


      }, error => {
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
          this.storageService.username = this.form.username;
          this.router.navigate(['/verify']);
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
      .subscribe(value => this.router.navigate(['/id/' + value.id]), error => console.log(error));
  }

}
