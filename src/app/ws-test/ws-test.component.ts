import {Component, OnInit} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';
import {IncomingMessage} from '../models/incoming-message';

@Component({
  selector: 'app-ws-test',
  templateUrl: './ws-test.component.html',
  styleUrls: ['./ws-test.component.css']
})
export class WsTestComponent implements OnInit {
  loggedUsername: string;
  msgEnabled = true;
  selectedConversation: Conversation;
  receiver: User;
  conversations: Conversation[];
  messages: Message[];
  privateMsg: IncomingMessage;

  constructor(
    private messageService: WsMessageService,
    private tokenService: TokenStorageService
  ) {
  }

  ngOnInit() {
    this.getConversations();
    if (this.tokenService.getToken()) {
      this.loggedUsername = this.tokenService.getUsername();
    } else {
      console.error('Please Log in!');
    }
  }

  getReceiver() {
    if (this.conversations) {
      // this.selectedConversation = this.conversations[this.conversations.length - 1];
      this.receiver = this.conversations[this.conversations.length - 1]
        .users.filter(user => user.username !== this.tokenService.getUsername())[0];
    } else {
      console.error('Can not get receiver: No conversations was found!');
    }
  }

  onConversation(conversation: Conversation) {
    console.log('Selected conversation: ');
    console.log(conversation);
    if (!this.selectedConversation || this.selectedConversation.id !== conversation.id) {
      this.selectedConversation = conversation;
      this.receiver = conversation.users[0].username !== this.loggedUsername ?
        conversation.users[0] : conversation.users[1];
      this.messageService.getMessages(conversation.id, (messages) => {
        console.log('Incoming messages:');
        console.log(messages);
        this.messages = messages;
      });
      this.privateMsg = new IncomingMessage();
      this.privateMsg.conversationId = conversation.id;
      this.privateMsg.recipientId = conversation.users[0].username === this.loggedUsername ?
        conversation.users[1].id : conversation.users[0].id;
      this.privateMsg.senderId = conversation.users[0].username === this.loggedUsername ?
        conversation.users[0].id : conversation.users[1].id;
    }
  }

  private getConversations() {
    this.messageService.getConversations(this.tokenService.getUsername(), (answer) => {
      console.log(answer);
      console.log(answer.body);
      this.conversations = JSON.parse(answer.body);
      // this.getReceiver();
    });
  }

  private sendPrivateMsg($event) {
    console.log(this.privateMsg.content);
    this.messageService.sendPrivateMsg(this.privateMsg);
  }

  private clearConversations() {
    this.messageService.disconnect();
  }


  switchMsg() {
    this.msgEnabled = !this.msgEnabled;

    if (this.msgEnabled) {
      this.getConversations();
    } else {
      this.conversations = null;
      this.clearConversations();
    }
  }
}
