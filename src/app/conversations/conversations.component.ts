import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';
import {UserService} from '../services/user.service';
import {ChatService} from '../services/chat.service';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit {
  loggedUser = new User();
  private conversations: Conversation[];
  private selectedConversation: Conversation;
  private unreadMessages = new Map<number, Message[]>();
  private draftMessages = new Map<number, Message>();
  msgEnabled = false;

  constructor(
    private messageService: WsMessageService,
    private storageService: TokenStorageService,
    private chatService: ChatService,
    private userService: UserService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit() {
    if (this.storageService.getToken()) {
      this.loggedUser.username = this.storageService.getUsername();
      this.msgEnabled = this.storageService.areConversationsEnabled();
      if (this.msgEnabled) {
        this.getConversations();
        this.getUnreadMessages();
      }
    } else {
      console.error('Please Log in to start messaging!');
    }
  }

  private getConversations() {
    this.messageService.getConversations(this.storageService.getUsername()).subscribe((conversations) => {
      this.conversations = conversations;

      if (this.storageService.getSelectedConversationId()) {
        this.openConversation(this.conversations.find(value => value.id === this.storageService.getSelectedConversationId()));
      }

      this.messageService.subscribeForConversationsUpdates(this.loggedUser.username, (conversation: Conversation) => {
        const foundIndex = this.conversations.findIndex(value => value.id === conversation.id);

        // foundIndex = -1 if upcoming conversation is new and was not found in array
        if (foundIndex >= 0) {
          this.conversations[foundIndex] = conversation;
          this.conversations = this.conversations
            .sort((a, b) => ChatService.compareConversationsByTheLastMessage(a, b));
        } else {
          this.conversations.unshift(conversation);
        }

        if ((!this.selectedConversation || conversation.id !== this.selectedConversation.id)
          && conversation.theLastMessage.sender.username !== this.loggedUser.username) {
          this.unreadMessages.get(conversation.id) ?
            this.unreadMessages.get(conversation.id).unshift(conversation.theLastMessage) :
            this.unreadMessages.set(conversation.id, [conversation.theLastMessage]);
        }
      });
    });
  }

  // fixme: change unreadMessages number due to ws
  openConversation(conversation: Conversation) {
    if (!this.selectedConversation || this.selectedConversation.id !== conversation.id) {
      if (this.selectedConversation) {
        this.messageService.messagesDisconnect();
        this.chatService.messages = null;
        this.selectedConversation = null;
      }
      this.storageService.setSelectedConversationId(conversation.id);
      this.selectedConversation = conversation;
      this.chatService.init(conversation, true);
      if (this.draftMessages.get(conversation.id)) {
        this.chatService.draftMessage = this.draftMessages.get(conversation.id);
      } else {
        this.chatService.initDraftMessage();
      }
      this.chatService.conversationClosed.subscribe(next =>
        this.onCloseConversation(next));
      this.chatService.unreadMessagesEmitter.subscribe(next =>
        this.unreadMessages.set(conversation.id, next));
    }
  }

  private clearConversations() {
    this.conversations = null;
    this.messageService.conversationsDisconnect();
    if (!this.chatService.isMsgWindowMaximized) {
      this.selectedConversation = null;
      this.messageService.messagesDisconnect();
    }
  }

  enableOrDisableConversations() {
    this.msgEnabled = !this.msgEnabled;
    this.storageService.setConversationsEnabled(this.msgEnabled);

    if (this.msgEnabled) {
      this.getConversations();
      this.getUnreadMessages();
    } else {
      if (this.chatService.isMsgWindowMaximized) {
        this.chatService.messages = null;
        this.selectedConversation = null;
      }
      this.conversations = null;
      this.clearConversations();
    }
  }

  getUnreadMessages() {
    // group unread messages by conversationId
    this.userService.getUnreadMessages(this.loggedUser.username)
      .subscribe(messages => messages.forEach(message => {
        if (this.unreadMessages.get(message.conversationId)) {
          if (this.unreadMessages.get(message.conversationId).findIndex(value => value.id === message.id) < 0) {
            this.unreadMessages.get(message.conversationId).unshift(message);
          }
        } else {
          this.unreadMessages.set(message.conversationId, []);
          this.unreadMessages.get(message.conversationId).unshift(message);
        }
      }));
  }

  getNumberOfUnreadMessages(conversation: Conversation): number {
    return this.unreadMessages.get(conversation.id) ? this.unreadMessages.get(conversation.id).length : -1;
  }

  onCloseConversation(isClosed: boolean) {
    if (isClosed) {
      if (this.chatService.draftMessage && this.chatService.draftMessage.content && this.chatService.draftMessage.content.trim() !== '') {
        this.draftMessages.set(this.selectedConversation.id, this.chatService.draftMessage);
      } else if (this.draftMessages.get(this.selectedConversation.id)) {
        this.draftMessages.set(this.selectedConversation.id, null);
      }
      this.selectedConversation = null;
    }
  }

}
