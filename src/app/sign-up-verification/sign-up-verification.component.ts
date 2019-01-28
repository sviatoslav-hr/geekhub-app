import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth/auth.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {error} from '@angular/compiler/src/util';

@Component({
  selector: 'app-sign-up-verification',
  templateUrl: './sign-up-verification.component.html',
  styleUrls: ['./sign-up-verification.component.css']
})
export class SignUpVerificationComponent implements OnInit {

  code: number;

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
        console.log(data);
        if (data.message === 'Code matches') {
          window.location.href = '/signin';
        }
      },
      error => {

      },
    )
    ;
  }

}
