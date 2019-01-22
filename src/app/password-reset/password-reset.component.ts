import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth/auth.service';
import {TokenStorageService} from '../services/auth/token-storage.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  username: string;
  code: number;
  newPassword = '';
  codeSent: boolean;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService
  ) {
  }

  ngOnInit() {
    console.log('inside pass reset');
    this.codeSent = false;
  }

  onSubmitEmail() {
    console.log('inside email submit');
    console.log(this.username);

    this.authService.sendUsernameForPasswordReset(this.username).subscribe(data => {
        console.log(data);
      this.tokenStorage.saveUsername(this.username);
        // console.log(data.message);
        if (data.toString() === 'Code sent') {
          console.log('true');
          // this.codeSent = true;
        }
        if (data === 'user not found') {
          console.log('user not found');
        }
        this.codeSent = true;
      },
    );
  }

  onSubmitNewPassword() {
    console.log('inside new password submit');
    console.log(this.code);
    console.log(this.newPassword);

    this.authService.sendNewPassword(this.code, this.newPassword, this.tokenStorage.getUsername()).subscribe(data => {
      console.log('new password sent');
    });
  }

}
