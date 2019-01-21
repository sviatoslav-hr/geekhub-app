import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth/auth.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  username: string;
  code: number;
  password: string;

  constructor(
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    console.log('inside pass reset');
  }

  onSubmitEmail() {
    console.log('inside email submit');
    console.log(this.username);

    this.authService.sendUsernameForPasswordReset(this.username).subscribe(data => {
        console.log(data);
        console.log(data);
        console.log(data.message);
        if (data.message === 'Code sent') {
          console.log('true');
        }
        if (data.message === 'user not found') {
          console.log('user not found');
        }
      },
    );
  }

  onSubmitNewPassword() {
    console.log('inside new password submit');
  }

}
