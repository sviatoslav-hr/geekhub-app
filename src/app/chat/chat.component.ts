import {Component, ElementRef, OnInit} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';
import {IncomingMessage} from '../models/incoming-message';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  loggedUsername: string;
  msgEnabled = true;
  selectedConversation: Conversation;
  receiver: User;
  conversations: Conversation[];
  messages: Message[];
  privateMsg: IncomingMessage;
  msgContainer: any;

  constructor(
    private messageService: WsMessageService,
    private tokenService: TokenStorageService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit() {
    if (this.tokenService.getToken()) {
      this.getConversations();
      this.loggedUsername = this.tokenService.getUsername();

    } else {
      console.error('Please Log in to start messaging!');
    }
  }

  onConversation(conversation: Conversation) {
    if (!this.selectedConversation || this.selectedConversation.id !== conversation.id) {
      this.selectedConversation = conversation;
      this.receiver = conversation.users[0].username !== this.loggedUsername ?
        conversation.users[0] : conversation.users[1];
      this.messageService.getMessages(conversation.id, (messages) => {
        this.messages = messages;

        const elementById = document.getElementById('msg-container');
        elementById.scrollTo(0, elementById.scrollHeight);
      });

      this.privateMsg = new IncomingMessage();
      this.privateMsg.conversationId = conversation.id;
      this.privateMsg.recipientUsername = conversation.users[0].username === this.loggedUsername ?
        conversation.users[1].username : conversation.users[0].username;
      this.privateMsg.senderUsername = conversation.users[0].username === this.loggedUsername ?
        conversation.users[0].username : conversation.users[1].username;
    }
  }

  private getConversations() {
    this.messageService.getConversations(this.tokenService.getUsername(), (answer) => {
      this.conversations = JSON.parse(answer.body);

      this.messageService.subscribeForConversations(this.loggedUsername, (conversation) => {
        console.log('%c getting new conversation_________________________________________', 'color: blue;');
        const isNewConversation = !this.conversations.filter(value => value.id === conversation.id);

        if (!isNewConversation) {
          console.log('%c creating new conversation', 'color: blue;');
          this.conversations = this.conversations.filter(value => value.id !== conversation.id)
            .sort((a, b) => {
              return a.theLastMessage.date.getTime() - b.theLastMessage.date.getTime();
            });
        }
        this.conversations.push(conversation);
      });
    });
  }

  private sendPrivateMsg(input) {
    this.messageService.sendPrivateMsg(this.privateMsg);
    input.value = '';
  }

  private clearConversations() {
    this.messageService.disconnect();
  }


  switchMsg() {
    this.msgEnabled = !this.msgEnabled;

    if (this.msgEnabled) {
      this.getConversations();
    } else {
      this.messages = null;
      this.conversations = null;
      this.selectedConversation = null;
      this.clearConversations();
    }
  }

  getHeightByTop(element): number {
    const height = window.innerHeight - element.offsetTop - this.elementRef.nativeElement.offsetTop;
    return height;
  }

  closeConversation() {
    this.selectedConversation = null;
    this.messages = null;
  }
}
