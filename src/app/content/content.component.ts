import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {TokenStorageService} from '../services/auth/token-storage.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  isLoggedIn = false;

  constructor(
    private authService: AuthenticationService,
    private tokenStorage: TokenStorageService
  ) {
  }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
    }
  }

}
