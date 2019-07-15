import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {LocalStorageService} from '../../../services/local-storage.service';
import {error} from '@angular/compiler/src/util';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-sign-up-verification',
  templateUrl: './sign-up-verification.component.html',
  styleUrls: ['./sign-up-verification.component.css']
})
export class SignUpVerificationComponent implements OnInit {
  code: number;
  errorMessage = '';
  verificationIsFailed = false;

  constructor(
    private authService: AuthService,
    private storageService: LocalStorageService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
  }


  onSubmit() {
    this.authService.sendCode(this.storageService.username, this.code)
      .subscribe(() => this.authService.attemptAutoAuth()
          .subscribe(() => this.redirectToUserHome()),
        httpError => {
          this.verificationIsFailed = true;
          this.errorMessage = 'Code is incorrect';
        },
      )
    ;
  }

  redirectToUserHome() {
    this.userService.getUserByUsername(this.storageService.username)
      .subscribe(value => this.router.navigate(['/id/' + value.id]),
        errorResponse => console.log(errorResponse));
  }
}
