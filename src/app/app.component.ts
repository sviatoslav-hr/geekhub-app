import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from './services/local-storage.service';
import {UserService} from './services/user.service';
import {User} from './models/user';
import {AuthService} from './services/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private domen = 'http://localhost:4200';
  private allowedURLs: string[] = [
    this.domen + '/',
    this.domen + '/verify'
  ];


  constructor(
    private storageService: LocalStorageService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (this.storageService.token) {
      this.authService.requestCurrentUser();
    } else if (!this.allowedURLs.includes(window.location.href)) {
      this.router.navigate(['/']);
    }
  }
}
