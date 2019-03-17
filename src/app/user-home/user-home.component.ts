import {Component, OnInit, ViewChild} from '@angular/core';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {UserService} from '../services/user.service';
import {User} from '../models/user';
import {ActivatedRoute} from '@angular/router';
import {FriendsService} from '../services/friends.service';
import {WsMessageService} from '../websocket/ws-message.service';
import {OutgoingMessage} from '../models/outgoing-message';
import {ChatService} from '../services/chat.service';
import {Conversation} from '../models/conversation';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {
  loggedUser: User = null;
  userHome: User = null;
  privateMsgEnabled = false;

  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService,
    private friendsService: FriendsService,
    private route: ActivatedRoute,
    private msgService: WsMessageService,
    private chatService: ChatService
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

  private getFriendsList() {
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

  private checkOutgoingRequests(): boolean {
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

  private checkIncomingRequests(): boolean {
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

  private checkFriend(): boolean {
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

  private sendFriendRequest() {
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

  private acceptFriendRequest() {
    this.friendsService.acceptFriendRequest(this.userHome.id).subscribe(v => {
      this.loggedUser.incomingFriendRequests = undefined;
      this.loggedUser.friends = undefined;
      this.getFriendRequests();
      this.getFriendsList();
    });
  }

  private cancelFriendRequest() {
    this.friendsService.cancelFriendRequest(this.userHome.id).subscribe(v => {
      this.loggedUser.outgoingFriendRequests = undefined;
      this.getFriendRequests();
    });
  }

  private removeFromFriends() {
    this.friendsService.deleteFriend(this.userHome.id).subscribe(v => {
      this.loggedUser.friends = undefined;
      this.getFriendsList();
    });
  }

  private openPrivateMsgWindow() {
    if (!this.privateMsgEnabled) {
      this.msgService.createConversationIfNotExists(this.userHome.id)
        .subscribe(conversation => {
          if (conversation) {
            this.privateMsgEnabled = true;
            this.chatService.init(conversation, false);
            this.chatService.initDraftMessage();
            this.chatService.conversationClosed.subscribe(next =>
              this.privateMsgEnabled = false
            );
          } else {
            console.log('Conversation equals null');
          }
        }, error => {
          console.error('Something gone wrong during creating conversation :(');
          console.log(error);
        });
    } else {
      this.privateMsgEnabled = false;
    }
  }
}
