import {Component, OnInit} from '@angular/core';
import {User} from '../../models/user';
import {FriendRequest} from '../../models/friend-request';
import {FriendsService} from '../../services/friends.service';
import {TokenStorageService} from '../../services/auth/token-storage.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  friends: User[];
  incomingFriendRequests: FriendRequest[];
  outgoingFriendRequests: FriendRequest[];

  constructor(
    private friendsService: FriendsService,
    private tokenService: TokenStorageService,
  ) {
  }

  ngOnInit() {
    this.getFriends();
    this.getIncomingFriendRequests();
    this.getOutgoingFriendRequests();
  }

  getFriends() {
    this.friendsService.getFriendsListByUsername(this.tokenService.getUsername())
      .subscribe(friendsList => {
        this.friends = friendsList;
      });
  }

  getIncomingFriendRequests() {
      this.friendsService.getIncomingFriendRequests()
        .subscribe(requests => this.incomingFriendRequests = requests, error => console.log(error));
  }

  getOutgoingFriendRequests() {
    this.friendsService.getOutgoingFriendRequests()
      .subscribe(requests => this.outgoingFriendRequests = requests, error => console.log(error));
  }

  acceptFriendRequest(senderId: number) {
    this.friendsService.acceptFriendRequest(senderId).subscribe(value => {
      this.getFriends();
      this.getIncomingFriendRequests();
    });
  }

  removeFromFriends(friendId: number) {
    this.friendsService.deleteFriend(friendId).subscribe(value => {
      this.getFriends();
      this.getIncomingFriendRequests();
    });
  }

  cancelFriendRequest(receiverId: number) {
    this.friendsService.cancelFriendRequest(receiverId).subscribe(value => {
      this.getOutgoingFriendRequests();
    });
  }


}
