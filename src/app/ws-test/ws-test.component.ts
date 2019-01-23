import {Component, OnInit} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';

@Component({
  selector: 'app-ws-test',
  templateUrl: './ws-test.component.html',
  styleUrls: ['./ws-test.component.css']
})
export class WsTestComponent implements OnInit {
  msgEnabled = true;
  selectedConversation: Conversation;
  receiver: User;
  conversations: Conversation[];
  messages: Message[];

  constructor(
    private messageService: WsMessageService,
    private tokenService: TokenStorageService
  ) {
  }

  ngOnInit() {
    this.getConversations();
  }

  getReceiver() {
    if (this.conversations) {
      this.selectedConversation = this.conversations[this.conversations.length - 1];
      this.receiver = this.conversations[this.conversations.length - 1]
        .users.filter(user => user.username !== this.tokenService.getUsername())[0];
    } else {
      console.error('Can not get receiver: No conversations was found!');
    }
  }

  onConversation(conversation: Conversation) {
    if (this.selectedConversation.id !== conversation.id) {
      this.messages = this.messageService.getMessages(conversation.id);
    }
  }

  private getConversations() {
    this.messageService.getConversations(this.tokenService.getUsername(), (answer) => {
      console.log(answer);
      console.log(answer.body);
      this.conversations = JSON.parse(answer.body);
      this.getReceiver();
    });
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
