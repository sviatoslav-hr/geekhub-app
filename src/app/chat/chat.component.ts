import {Component, ElementRef, OnInit} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';
import {OutgoingMessage} from '../models/outgoing-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  loggedUsername: string;
  msgEnabled = false;
  isMsgWindowMaximized = true;
  selectedConversation: Conversation;
  receiver: User;
  conversations: Conversation[];
  messages: Message[];
  privateMsg: OutgoingMessage;


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
      this.msgEnabled = this.tokenService.areConversationsEnabled() ? this.tokenService.areConversationsEnabled() : false;
    } else {
      console.error('Please Log in to start messaging!');
    }
  }

  onConversation(conversation: Conversation) {
    if (!this.selectedConversation || this.selectedConversation.id !== conversation.id) {
      this.setNewPrivateMessage(conversation);
      this.selectedConversation = conversation;
      this.receiver = conversation.users[0].username !== this.loggedUsername ?
        conversation.users[0] : conversation.users[1];
      this.messageService.getMessagesForConversation(conversation.id, (messages: Message[]) => {
        this.messages = messages.reverse();

        this.checkIfMessagesAreRead();
        // if (this.messages[0].sender.username === this.loggedUsername) {
        //   const elementById = document.getElementById('msg-container');
        //   elementById.scrollTo(0, elementById.scrollHeight);
        // }
        this.getNewMessage(conversation);

      });

    }
  }

  private getNewMessage(conversation: Conversation) {
    this.messageService.subscribeForNewMessages(conversation.id, (newMessage: Message) => {
      console.log(newMessage);
      if (newMessage.sender.username === this.loggedUsername) {
        const oldMessageIndex = this.messages.findIndex(message => {
          console.log(message);
          return message.constructor.name === 'OutgoingMessage'
            && message.parentMessage && message.parentMessage.id === newMessage.parentMessage.id;
        });
        this.messages[oldMessageIndex] = newMessage;
        this.checkIfMessagesAreRead();
      } else {
        this.messages.unshift(newMessage);
      }
    });
  }

  private getConversations() {
    this.messageService.getConversations(this.tokenService.getUsername(), (answer) => {
      this.conversations = JSON.parse(answer.body);

      this.messageService.subscribeForConversations(this.loggedUsername, (conversation) => {
        const isNewConversation = !this.conversations.filter(value => value.id === conversation.id);

        if (!isNewConversation) {
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
    if (this.messages) {
      this.privateMsg.parentMessage = this.messages[0];
    }
    this.privateMsg.date = new Date();
    if (this.privateMsg.content && this.privateMsg.content.length > 0) {
      this.messageService.sendPrivateMsg(this.privateMsg);
      this.messages.unshift(this.privateMsg);
    }
    input.value = '';

    const elementById = document.getElementById('msg-container');
    elementById.scrollTo(0, elementById.scrollHeight);

    this.setNewPrivateMessage(this.selectedConversation);
  }

  private clearConversations() {
    this.conversations = null;
    this.messageService.disconnect();
  }

  switchMsg() {
    this.msgEnabled = !this.msgEnabled;
    this.tokenService.setConversationsEnabled(this.msgEnabled);

    if (this.msgEnabled) {
      this.tokenService.setConversationsEnabled(this.msgEnabled);
      this.getConversations();
    } else {
      if (this.isMsgWindowMaximized) {
        this.messages = null;
        this.selectedConversation = null;
      }
      this.conversations = null;
      this.clearConversations();
    }
  }

  getHeightByTop(element): number {
    const height = window.innerHeight - (element.offsetTop ? element.offsetTop : this.elementRef.nativeElement.offsetTop);
    return height;
  }

  closeConversation() {
    this.selectedConversation = null;
    this.messages = null;
  }

  private setNewPrivateMessage(conversation: Conversation) {
    this.privateMsg = new OutgoingMessage();
    this.privateMsg.conversationId = conversation.id;
    this.privateMsg.recipientUsername = conversation.users[0].username === this.loggedUsername ?
      conversation.users[1].username : conversation.users[0].username;
    this.privateMsg.senderUsername = conversation.users[0].username === this.loggedUsername ?
      conversation.users[0].username : conversation.users[1].username;
  }

  switchMsgWindow() {
    document.getElementById('chat-outer-container').removeAttribute('style');
    this.isMsgWindowMaximized = !this.isMsgWindowMaximized;
  }

  private checkIfMessagesAreRead() {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].notSeenByUsers.filter(user => user.username === this.receiver.username).length === 0) {
        for (let j = i; j < this.messages.length; j++) {
          if (this.messages[j].isRead === true) {
            break;
          }
          this.messages[j].isRead = true;
        }
        break;
      }
    }
  }
}
