import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {LocalStorageService} from '../../../services/local-storage.service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-sign-up-verification',
  templateUrl: './sign-up-verification.component.html',
  styleUrls: ['./sign-up-verification.component.css']
})
export class SignUpVerificationComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private storageService: LocalStorageService,
    private userService: UserService,
    private router: Router
  ) {
  }
  code: number;
  errorMessage = '';
  verificationIsFailed = false;
  censoredEmail: string;
  isSendCodeAgainBlocked = false;
  codeSendAgainResponse: string;

  static censorWord(str: string) {
    return str[0] + '*'.repeat(str.length - 2) + str.slice(-1);
  }

  ngOnInit() {
    if (!LocalStorageService.username) {
      this.router.navigate(['/']);
    } else {
      this.censorEmail();
    }
  }


  onSubmit() {
    this.authService.verifyEmail(LocalStorageService.username, this.code)
      .subscribe(() => this.authService.attemptAutoAuth()
          .subscribe(() => this.redirectToUserHome()),
        () => {
          this.verificationIsFailed = true;
          this.errorMessage = 'Code is incorrect';
          this.codeSendAgainResponse = null;
        },
      );
  }

  redirectToUserHome() {
    this.userService.getUserByUsername(LocalStorageService.username)
      .subscribe(value => this.router.navigate(['/id/' + value.id]),
        errorResponse => console.log(errorResponse));
  }

  sendCodeAgain() {
    this.isSendCodeAgainBlocked = true;
    this.codeSendAgainResponse = null;
    this.authService.sendCodeToEmail(LocalStorageService.username)
      .subscribe((data) => {
        console.log(data);
        this.codeSendAgainResponse = 'Code was sent successfully. Please, check your email.';
        setTimeout(() => {
          this.isSendCodeAgainBlocked = false;
        }, 20 * 1000);
      }, (err) => {
        console.log(err);
        this.isSendCodeAgainBlocked = false;
        this.codeSendAgainResponse = err.error.message;
      });
  }

  censorEmail() {
    const arr = LocalStorageService.username.split('@');
    this.censoredEmail = SignUpVerificationComponent.censorWord(arr[0]) + '@' + SignUpVerificationComponent.censorWord(arr[1]);
  }
}
