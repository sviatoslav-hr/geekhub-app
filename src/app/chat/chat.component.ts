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
  newMessages: Message[] = [];
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
      this.msgEnabled = this.tokenService.areConversationsEnabled();
    } else {
      console.error('Please Log in to start messaging!');
    }
  }

  onConversation(conversation: Conversation) {
    // console.log('%cinside OnConversation', 'color: green; font-size: 20px');
    if (!this.selectedConversation || this.selectedConversation.id !== conversation.id) {
      this.setNewPrivateMessage(conversation);
      this.selectedConversation = conversation;
      this.receiver = conversation.users[0].username !== this.loggedUsername ?
        conversation.users[0] : conversation.users[1];

      this.messageService.getMessagesForConversation(conversation.id, (messages: Message[]) => {
        // console.log('%cinside getting messages list', 'color: red; font-size: 20px');
        this.messages = messages.reverse();

        this.subscribeForNewMessages(conversation);

        this.messageService.saveMessagesAsRead(this.selectedConversation.id, this.loggedUsername);
        this.messageService.subscribeForReadMessagesUpdates(conversation.id, (readMessages: Message[]) => {
          readMessages.forEach(message => {
            const findIndex = this.messages.findIndex(value => value.id === message.id);
            this.messages[findIndex] = message;
          });
        });
      });
    }
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

  private clearConversations() {
    this.conversations = null;
    this.messageService.conversationsDisconnect();
  }

  switchMsgWindow() {
    document.getElementById('chat-outer-container').removeAttribute('style');
    this.isMsgWindowMaximized = !this.isMsgWindowMaximized;
  }

  switchConversations() {
    this.msgEnabled = !this.msgEnabled;
    this.tokenService.setConversationsEnabled(this.msgEnabled);

    if (this.msgEnabled) {
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
    return window.innerHeight - (element.offsetTop ? element.offsetTop : this.elementRef.nativeElement.offsetTop);
  }

  closeConversation() {
    this.selectedConversation = null;
    this.messages = null;
    this.messageService.messagesDisconnect();
  }

  private sendPrivateMsg(input) {
    if (this.messages) {
      this.privateMsg.parentMessageId = this.messages[0].id;
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

  private setNewPrivateMessage(conversation: Conversation) {
    this.privateMsg = new OutgoingMessage();
    this.privateMsg.conversationId = conversation.id;
    this.privateMsg.recipientUsername = conversation.users[0].username === this.loggedUsername ?
      conversation.users[1].username : conversation.users[0].username;
    this.privateMsg.senderUsername = conversation.users[0].username === this.loggedUsername ?
      conversation.users[0].username : conversation.users[1].username;
  }

  private subscribeForNewMessages(conversation: Conversation) {
    // console.log('%cinside subscribing for new message', 'color: blue; font-size: 20px;');
    // fixme: websocket subscribes from anonymous window to current
    this.messageService.subscribeForNewMessages(conversation.id, (newMessage: Message) => {
      if (this.messages[0].id !== newMessage.id) {
        if (this.newMessages.length > 0 && this.newMessages[0].id === newMessage.id) {
          console.log('%cError: trying to add already added new message.', 'color: red; font-size: 16px;');
          return;
        }
        if (newMessage.sender.username === this.loggedUsername) {
          const oldMessageIndex = this.messages.findIndex(message => {
            return message.constructor.name === 'OutgoingMessage'
              && message.parentMessageId && message.parentMessageId === newMessage.parentMessageId;
          });
          this.messages[oldMessageIndex] = newMessage;
        } else {
          const elementById = document.getElementById('msg-container');
          // if messages was scrolled to bottom
          // fixme: replace '30' with height of the last msg block
          if (elementById.scrollHeight - elementById.scrollTop < elementById.offsetHeight + 30) {
            this.messageService.saveMessagesAsRead(this.selectedConversation.id, this.loggedUsername);
            this.messages.unshift(newMessage);
          } else {
            this.newMessages.unshift(newMessage);
          }
        }
        this.privateMsg.parentMessageId = newMessage.id;
      } else {
        console.log('%cError: trying to add already added message.', 'color: red; font-size: 16px;');
      }
    });

  }

  checkIfNewMessage() {
    const newMessagesBlock = document.getElementById('new-messages-block');
    const msgContainer = document.getElementById('msg-container');
    // if was scrolled to block of new messages
    if (msgContainer.scrollHeight - msgContainer.scrollTop < msgContainer.offsetHeight + newMessagesBlock.offsetHeight) {
      console.log('%cmessage is in view', 'color: blue; font-size: 16px;');
      this.messageService.saveMessagesAsRead(this.selectedConversation.id, this.loggedUsername);
      this.newMessages.forEach(newMessage => this.messages.unshift(newMessage));
      this.newMessages = [];
    } else {
      console.log('%cmessage is not in view', 'color: red; font-size: 16px;');
    }
  }
}
