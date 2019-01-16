import {Component, OnInit} from '@angular/core';
import {FriendsService} from '../services/friends.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';
import {AppComponent} from '../app.component';
import {FriendRequest} from '../models/friend-request';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  friends: User[];
  friendRequests: FriendRequest[];

  constructor(
    private friendsService: FriendsService,
    private tokenService: TokenStorageService,
  ) {
  }

  ngOnInit() {
    this.getFriends();
    this.getFriendRequests();
  }

  getFriends() {
    this.friendsService.getFriendsListByUsername(this.tokenService.getUsername())
      .subscribe(friendsList => {
        this.friends = friendsList;
      });
  }

  getFriendRequests() {
    this.friendsService.getIncomingFriendRequests()
      .subscribe(requests => this.friendRequests = requests, error => console.log(error));
  }

  acceptFriendRequest(senderId: number) {
    this.friendsService.acceptFriendRequest(senderId).subscribe();
  }

}
