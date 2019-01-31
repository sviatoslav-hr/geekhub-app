import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {ActivatedRoute} from '@angular/router';
import {FriendsService} from '../services/friends.service';
import {WsMessageService} from '../websocket/ws-message.service';
import {Message} from '../models/message';
import {IncomingMessage} from '../models/incoming-message';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {
  private privateMsg: IncomingMessage;
  loggedUser: User = null;
  userHome: User = null;
  privateMsgEnabled = false;

  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService,
    private friendsService: FriendsService,
    private route: ActivatedRoute,
    private msgService: WsMessageService
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

  getFriendRequests() {
    if (!this.loggedUser.incomingFriendRequests && this.loggedUser.incomingFriendRequests !== null) {
      this.friendsService.getIncomingFriendRequests()
        .subscribe(requests => this.loggedUser.incomingFriendRequests = requests, error => console.log(error));
      if (!this.loggedUser.incomingFriendRequests) {
        this.loggedUser.incomingFriendRequests = null;
      }
    }
    if (!this.loggedUser.outgoingFriendRequests && this.loggedUser.outgoingFriendRequests !== null) {
      this.friendsService.getOutgoingFriendRequests()
        .subscribe(requests => {
          this.loggedUser.outgoingFriendRequests = requests;
        }, error => console.log(error));
      if (!this.loggedUser.outgoingFriendRequests) {
        this.loggedUser.outgoingFriendRequests = null;
      }
    }
  }

  getFriendsList() {
    if (this.loggedUser.friends === undefined) {
      this.friendsService.getFriendsList()
        .subscribe(friends => {
          this.loggedUser.friends = friends;
        }, error => console.log(error));
      if (!this.loggedUser.friends) {
        this.loggedUser.friends = null;
      }
    }
  }

  checkOutgoingRequests(): boolean {
    const requests = this.loggedUser.outgoingFriendRequests;
    if (requests) {
      for (const request of requests) {
        if (request.receiver.id === this.userHome.id) {
          return true;
        }
      }
    } else {
      this.getFriendRequests();
      if (this.loggedUser.outgoingFriendRequests) {
        this.checkOutgoingRequests();
      }
    }
    return false;
  }

  checkIncomingRequests(): boolean {
    const requests = this.loggedUser.incomingFriendRequests;
    if (requests) {
      for (const request of requests) {
        if (request.receiver.id === this.loggedUser.id) {
          return true;
        }
      }
    } else {
      this.getFriendRequests();
      if (this.loggedUser.incomingFriendRequests) {
        this.checkIncomingRequests();
      }
    }
    return false;
  }

  checkFriend(): boolean {
    if (this.loggedUser.friends) {
      for (const friend of this.loggedUser.friends) {
        if (friend.id === this.userHome.id) {
          return true;
        }
      }
    } else {
      this.getFriendsList();
      if (this.loggedUser.friends) {
        this.checkFriend();
      }
    }
    return false;
  }

  sendFriendRequest() {
    if (this.userHome) {
      this.friendsService.sendFriendRequest(this.userHome.id)
        .subscribe(value => {
          this.loggedUser.outgoingFriendRequests = undefined;
          this.getFriendRequests();
        }, error => console.log(error));
    } else {
      console.log('homeUser is NULL');
    }
  }

  acceptFriendRequest() {
    this.friendsService.acceptFriendRequest(this.userHome.id).subscribe(value => {
      this.loggedUser.incomingFriendRequests = undefined;
      this.loggedUser.friends = undefined;
      this.getFriendRequests();
      this.getFriendsList();
    });
  }

  cancelFriendRequest() {
    this.friendsService.cancelFriendRequest(this.userHome.id).subscribe(value => {
      this.loggedUser.outgoingFriendRequests = undefined;
      this.getFriendRequests();
    });
  }

  removeFromFriends() {
    this.friendsService.deleteFriend(this.userHome.id).subscribe(value => {
      this.loggedUser.friends = undefined;
      this.getFriendsList();
    });
  }

  togglePrivateMsg() {
    console.log('inside write msg');
    this.msgService.createConversationIfNotExists(this.userHome.id)
      .subscribe(conversation => {
        if (conversation) {
          console.log('Creating conversation...');
          console.log(conversation);
          this.privateMsg = new IncomingMessage();
          this.privateMsg.conversationId = conversation.id;
          this.privateMsg.recipientId = this.userHome.id;
          this.privateMsg.senderId = this.loggedUser.id;
          this.privateMsgEnabled = !this.privateMsgEnabled;
          console.log(this.privateMsgEnabled);
        } else {
          console.log('Something gone wrong during creating conversation :(');
        }
      }, error => {
        console.error('Something gone wrong during creating conversation :(');
        console.log(error);
      });
  }

  private sendPrivateMsg() {
    console.log(this.privateMsg.content);
    this.msgService.sendPrivateMsg(this.privateMsg);
  }
}
