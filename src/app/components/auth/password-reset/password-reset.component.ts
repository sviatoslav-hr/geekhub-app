import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {LocalStorageService} from '../../../services/local-storage.service';
import {Router} from '@angular/router';


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
    private storageService: LocalStorageService,
    private router: Router
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
        this.storageService.username = this.username;
        // console.log(data.ok);
        console.log(data.statusText);
        console.log(data);
        if (data.body.message === 'Code sent') {
          console.log('true');
          this.codeSent = true;
        }
        if (data.message === 'user not found') {
          console.log('user not found');
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  onSubmitNewPassword() {
    this.authService.sendNewPassword(this.code, this.newPassword, this.storageService.username).subscribe(data => {
        if (data.message === 'Password was changed') {
          this.router.navigate(['/signin']);
        }
      },
      error => {
        console.log(error);
      });
  }

}
