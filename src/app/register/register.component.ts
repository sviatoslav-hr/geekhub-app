import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth/auth.service';
import {SignUpInfo} from '../services/auth/signup-info';
import {TokenStorageService} from '../services/auth/token-storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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
        this.isSignedUp = true;
        this.isSignUpFailed = false;
        this.tokenStorage.saveUsername(this.signupInfo.username);
      },
      error => {
        console.log(error);
        this.errorMessage = error.error.message;
      }
    );
  }

}
