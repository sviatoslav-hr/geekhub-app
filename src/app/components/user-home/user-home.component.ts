import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from '../../services/local-storage.service';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user';
import {ActivatedRoute} from '@angular/router';
import {FriendsService} from '../../services/friends.service';
import {WebSocketMessageService} from '../../services/websocket/web-socket-message.service';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../services/auth/auth.service';
import {ChatService} from '../../services/chat.service';
import {ConversationsService} from '../../services/conversations.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {
  userHome: User = null;
  privateMsgEnabled = false;
  fileToUpload: File;
  formData = new FormData();

  constructor(
    private storageService: LocalStorageService,
    private authService: AuthService,
    private userService: UserService,
    private friendsService: FriendsService,
    private msgService: WebSocketMessageService,
    private chatService: ChatService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private conversationsService: ConversationsService
  ) {
  }

  ngOnInit() {
    if (LocalStorageService.token) {
      this.getUserFromURL();
    }
  }

  getUserFromURL() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.userService.getUserById(id).subscribe(value => {
      this.userHome = value;
    }, error => error.log);
  }

  getFriendRequests() {
    if (!this.authService.currentUser.incomingFriendRequests && this.authService.currentUser.incomingFriendRequests !== null) {
      this.friendsService.getIncomingFriendRequests()
        .subscribe(requests => this.authService.currentUser.incomingFriendRequests = requests, error => console.log(error));
      if (!this.authService.currentUser.incomingFriendRequests) {
        this.authService.currentUser.incomingFriendRequests = null;
      }
    }
    if (!this.authService.currentUser.outgoingFriendRequests && this.authService.currentUser.outgoingFriendRequests !== null) {
      this.friendsService.getOutgoingFriendRequests()
        .subscribe(requests => {
          this.authService.currentUser.outgoingFriendRequests = requests;
        }, error => console.log(error));
      if (!this.authService.currentUser.outgoingFriendRequests) {
        this.authService.currentUser.outgoingFriendRequests = null;
      }
    }
  }

  getFriendsList() {
    if (this.authService.currentUser.friends === undefined) {
      this.friendsService.getFriendsList()
        .subscribe(friends => {
          this.authService.currentUser.friends = friends;
        }, error => console.log(error));
      if (!this.authService.currentUser.friends) {
        this.authService.currentUser.friends = null;
      }
    }
  }

  checkOutgoingRequests(): boolean {
    const requests = this.authService.currentUser.outgoingFriendRequests;
    if (requests) {
      for (const request of requests) {
        if (request.receiver.id === this.userHome.id) {
          return true;
        }
      }
    } else {
      this.getFriendRequests();
      if (this.authService.currentUser.outgoingFriendRequests) {
        this.checkOutgoingRequests();
      }
    }
    return false;
  }

  checkIncomingRequests(): boolean {
    const requests = this.authService.currentUser.incomingFriendRequests;
    if (requests) {
      for (const request of requests) {
        if (request.receiver.id === this.authService.currentUser.id) {
          return true;
        }
      }
    } else {
      this.getFriendRequests();
      if (this.authService.currentUser.incomingFriendRequests) {
        this.checkIncomingRequests();
      }
    }
    return false;
  }

  checkFriend(): boolean {
    if (this.authService.currentUser.friends) {
      for (const friend of this.authService.currentUser.friends) {
        if (friend.id === this.userHome.id) {
          return true;
        }
      }
    } else {
      this.getFriendsList();
      if (this.authService.currentUser.friends) {
        this.checkFriend();
      }
    }
    return false;
  }

  sendFriendRequest() {
    if (this.userHome) {
      this.friendsService.sendFriendRequest(this.userHome.id)
        .subscribe(() => {
          this.authService.currentUser.outgoingFriendRequests = undefined;
          this.getFriendRequests();
        }, error => console.log(error));
    } else {
      console.log('homeUser is NULL');
    }
  }

  acceptFriendRequest() {
    this.friendsService.acceptFriendRequest(this.userHome.id).subscribe(() => {
      this.authService.currentUser.incomingFriendRequests = undefined;
      this.authService.currentUser.friends = undefined;
      this.getFriendRequests();
      this.getFriendsList();
    });
  }

  cancelFriendRequest() {
    this.friendsService.cancelFriendRequest(this.userHome.id).subscribe(() => {
      this.authService.currentUser.outgoingFriendRequests = undefined;
      this.getFriendRequests();
    });
  }

  removeFromFriends() {
    this.friendsService.deleteFriend(this.userHome.id).subscribe(() => {
      this.authService.currentUser.friends = undefined;
      this.getFriendsList();
    });
  }

  uploadImage(files: FileList) {
    this.fileToUpload = files.item(0);
    console.log(files.item(0));
    console.log(this.formData);
    this.formData.append('file', files.item(0), this.fileToUpload.name);
    this.http.post('http://localhost:8080/api/save-photo', this.formData).subscribe(() => {
      this.authService.requestCurrentUser();
      this.getUserFromURL();
      this.formData.delete('file');
    });
    return false;
  }

  private openPrivateMsgWindow() {
    if (!this.privateMsgEnabled) {
      this.msgService.createConversationIfNotExists(this.userHome.id)
        .subscribe(conversation => {
          if (conversation) {
            this.privateMsgEnabled = true;
            this.chatService.initialize(conversation, false);
            this.chatService.initDraftMessage();
            this.chatService.conversationClosedEmitter.subscribe(() =>
              this.privateMsgEnabled = false
            );
            this.conversationsService.selectedConversation = conversation;
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
