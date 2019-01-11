import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {
  loggedUser: User;
  userHome: User;

  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    console.log('trying to get logged user...');
    if (this.tokenStorage.getToken()) {
      this.getLoggedUser();
    }
    console.log('trying to load page user...');
    this.getUserFromURL();
  }

  getUserFromURL() {
    const id = +this.route.snapshot.paramMap.get('id');
    console.log('id from url: ' + id);
    this.userService.getUserById(id).subscribe(value => this.userHome = value, error => error.log);
  }

  getLoggedUser() {
    this.userService.getUserByUsername(this.tokenStorage.getUsername())
      .subscribe(value => this.loggedUser = value, error => error.log);
  }

}
