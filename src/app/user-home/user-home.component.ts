import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {ActivatedRoute} from '@angular/router';
import {FriendsService} from '../services/friends.service';

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
        this.getFriendsList();
      }, error => console.log(error));
  }

  sendFriendRequest() {
    if (this.userHome) {
      console.log('sending friend request...');
      let success: boolean;
      this.friendsService.sendFriendRequest(this.userHome.id)
        .subscribe(value => success = value, error => console.log(error));
    } else {
      console.log('homeUser is NULL');
    }
  }

  getFriendRequests() {
    console.log('getFriendRequests');
    if (!this.loggedUser.incomingFriendRequests) {
      console.log('getIncomingFriendRequests');
      this.friendsService.getIncomingFriendRequests()
        .subscribe(requests => this.loggedUser.incomingFriendRequests = requests, error => console.log(error));
    }
    if (this.loggedUser.outgoingFriendRequests) {
      console.log('getOutgoingFriendRequests');
      this.friendsService.getOutgoingFriendRequests()
        .subscribe(requests => this.loggedUser.outgoingFriendRequests = requests, error => console.log(error));
    }
  }

  checkOutgoingRequests(): boolean {
    console.log('comparing with outgoing requests');
    const requests = this.loggedUser.outgoingFriendRequests;
    if (requests) {
      for (const request of requests) {
        if (request.sender.id === this.loggedUser.id) {
          return true;
        }
      }
    }
    return false;
  }

  checkIncomingRequests(): boolean {
    console.log('comparing with incoming requests');
    const requests = this.loggedUser.incomingFriendRequests;
    if (requests) {
      for (const request of requests) {
        if (request.receiver.id === this.loggedUser.id) {
          return true;
        }
      }
    }
    return false;
  }

  checkFriend(): boolean {
    for (const friend of this.loggedUser.friends) {
      if (friend.id === this.userHome.id) {
        return true;
      }
    }
    return false;
  }

  acceptFriendRequest() {
    this.friendsService.acceptFriendRequest(this.userHome.id).subscribe();
  }

  cancelFriendRequest() {
    this.friendsService.cancelFriendRequest(this.userHome.id).subscribe();
  }

  getFriendsList() {
    console.log('getting friends list...');
    if (!this.loggedUser.friends) {
      this.friendsService.getFriendsList()
        .subscribe(friends => {
          this.loggedUser.friends = friends;
          this.getFriendRequests();
        }, error => console.log(error));
    }
  }
}
