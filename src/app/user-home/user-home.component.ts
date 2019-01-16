import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {ActivatedRoute} from '@angular/router';
import {FriendsService} from '../services/friends.service';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {
  loggedUser: User = null;
  userHome: User = null;


  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService,
    private friendsService: FriendsService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.getLoggedUser();
      this.getUserFromURL();
    }
  }

  getUserFromURL() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.userService.getUserById(id).subscribe(value => {
      this.userHome = value;
    }, error => error.log);
  }

  getLoggedUser() {
    const username = this.tokenStorage.getUsername();
    this.userService.getUserByUsername(username)
      .subscribe(value => {
        this.loggedUser = value;
      }, error => console.log(error));
  }

  sendFriendRequest() {
    if (this.userHome) {
      console.log('sending friend request...');
      let success: boolean;
      this.friendsService.sendFriendRequest(this.userHome.id).subscribe(value => success = value, error => console.log(error));
    } else {
      console.log('user home is NULL');
    }
  }

}
