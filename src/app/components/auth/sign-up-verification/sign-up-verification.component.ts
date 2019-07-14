import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {TokenStorageService} from '../../../services/auth/token-storage.service';
import {error} from '@angular/compiler/src/util';

@Component({
  selector: 'app-sign-up-verification',
  templateUrl: './sign-up-verification.component.html',
  styleUrls: ['./sign-up-verification.component.css']
})
export class SignUpVerificationComponent implements OnInit {

  code: number;
  errorMessage = '';
  verificationIsFailed = false;

  // message = '';

  constructor(
    private authService: AuthService,
    private tokenService: TokenStorageService
  ) {
  }

  ngOnInit() {
    // console.log('inside SignUpVerificationComponent');
    // this.tokenService.
  }


  onSubmit() {
    // this.authService.sendCode().subscribe(
    //   data => {
    //   }
    // );
    console.log(this.code);
    console.log(this.tokenService.getUsername());

    this.authService.sendCode(this.tokenService.getUsername(), this.code).subscribe(data => {
        // console.log(data);
        // console.log(data.body.httpStatus);
        if (data.body.httpStatus === 'OK') {
          window.location.href = '/signin';
        }
      },
      httpError => {
        // console.log(httpError);
        // console.log(httpError.httpError.httpStatus);
        this.verificationIsFailed = true;
        this.errorMessage = 'Code is incorrect';
      },
    )
    ;
  }

}
