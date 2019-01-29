import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth/auth.service';
import {SignUpInfo} from '../services/auth/signup-info';
import {TokenStorageService} from '../services/auth/token-storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  styles: [`
        input.ng-touched.ng-invalid {border:solid red 2px;}
        input.ng-touched.ng-valid {border:solid green 2px;}
    `],
})
export class RegisterComponent implements OnInit {
  signupInfo = new SignUpInfo();
  isSignedUp = false;
  isSignUpFailed = false;
  errorMessage = '';
  date: Date;
  year: string;
  month: string;
  dt: string;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService
  ) {
  }

  ngOnInit() {
  }

  onSubmit() {

    console.log(this.signupInfo);
    this.date = new Date(this.signupInfo.date);
    console.log('This date' + this.date);

    this.year = '' + this.date.getFullYear();
    this.month = '' + (this.date.getMonth() + 1);
    this.dt = '' + this.date.getDate();

    if (this.date.getDate() < 10) {
      this.dt = '0' + this.dt;
    }
    if (this.date.getMonth() < 10) {
      this.month = '0' + this.month;
    }

    console.log(this.dt + '-' + this.month + '-' + this.year);

    this.signupInfo.date = (this.year + '-' + this.month + '-' + this.dt);

    this.authService.signUp(this.signupInfo).subscribe(
      data => {
        console.log(data);
        console.log(data.statusText);
        if (data.body.httpStatus === 'OK') {
          console.log('User successfully signed up!!');
          this.isSignUpFailed = false;
          this.isSignedUp = true;
          this.tokenStorage.saveUsername(this.signupInfo.username);
        }
        if (data.body.httpStatus === 'IM_USED') {
          console.log('User already registered');
          console.log(data.body.message);
          this.isSignUpFailed = true;
          this.errorMessage = data.body.message;
        }
      },
      error => {
        console.log(error);
        this.errorMessage = error.error.message;
      }
    );
  }

}
