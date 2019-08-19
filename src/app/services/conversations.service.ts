import {Injectable} from '@angular/core';
import {Conversation} from '../models/conversation';
import {AuthService} from './auth/auth.service';
import {WebSocketConversationsService} from './websocket/web-socket-conversations.service';
import {LocalStorageService} from './local-storage.service';
import {WebSocketMessageService} from './websocket/web-socket-message.service';
import {ChatService} from './chat.service';
import {Message} from '../models/message';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationsService {
  private _conversations: Conversation[];
  private _selectedConversation: Conversation;
  private _unreadMessages = new Map<number, Message[]>();
  private _draftMessages = new Map<number, Message>();
  private _areEnabled = false;
  private isSubscribedForUpdates = false;

  constructor(
    private webSocketConversationsService: WebSocketConversationsService,
    private webSocketMessageService: WebSocketMessageService,
    private storageService: LocalStorageService,
    private chatService: ChatService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this._areEnabled = LocalStorageService.areConversationsEnabled;
  }

  get draftMessages(): Map<number, Message> {
    return this._draftMessages;
  }

  get conversations(): Conversation[] {
    return this._conversations;
  }

  get unreadMessages(): Map<number, Message[]> {
    return this._unreadMessages;
  }

  get selectedConversation(): Conversation {
    return this._selectedConversation;
  }

  set selectedConversation(value: Conversation) {
    this._selectedConversation = value;
  }

  get areEnabled(): boolean {
    return this._areEnabled;
  }

  set areEnabled(value: boolean) {
    this._areEnabled = value;
    LocalStorageService.areConversationsEnabled = this._areEnabled;
  }

  public loadConversations() {
    this.getConversations();
    this.getUnreadMessages();
  }

  private getConversations() {
    this.webSocketConversationsService.getConversations(LocalStorageService.username).subscribe((conversations) => {
      this._conversations = conversations;
      if (LocalStorageService.selectedConversationId) {
        const selectedConversation = this._conversations
          .find(value => value.id === LocalStorageService.selectedConversationId);
        if (selectedConversation) {
          this.openConversation(selectedConversation);
        }
      }
      if (!this.isSubscribedForUpdates) {
        this.subscribeForUpdates();
      }
    });
  }


  private subscribeForUpdates() {
    this.webSocketConversationsService.subscribeForConversationsUpdates(this.authService.currentUser.username,
      (conversation: Conversation) => {
        const foundIndex = this._conversations.findIndex(value => value.id === conversation.id);
        // foundIndex = -1 if upcoming conversation is new and was not found in array
        if (foundIndex >= 0) {
          this._conversations[foundIndex] = conversation;
          this._conversations = this._conversations
            .sort((a, b) => ChatService.compareConversationsByTheLastMessage(a, b));
        } else {
          this._conversations.unshift(conversation);
        }

        if (conversation.theLastMessage
          && conversation.theLastMessage.sender.username !== this.authService.currentUser.username) {
          this._unreadMessages.get(conversation.id) ?
            this._unreadMessages.get(conversation.id).unshift(conversation.theLastMessage) :
            this._unreadMessages.set(conversation.id, [conversation.theLastMessage]);
        }
      });
    this.isSubscribedForUpdates = true;
  }

  public openConversation(conversation: Conversation) {
    if (!this._selectedConversation || this._selectedConversation.id !== conversation.id) {
      if (this._selectedConversation) {
        this.unselectConversation();
      }
      LocalStorageService.selectedConversationId = conversation.id;
      this._selectedConversation = conversation;
      this.chatService.initialize(conversation, LocalStorageService.areConversationsEnabled);
      if (this._draftMessages.get(conversation.id)) {
        this.chatService.draftMessage = this._draftMessages.get(conversation.id);
      } else {
        this.chatService.initDraftMessage();
      }
      this.chatService.conversationClosedEmitter.subscribe(next =>
        this.onCloseConversation(next));
      this.chatService.unreadMessagesEmitter.subscribe(next =>
        this._unreadMessages.set(conversation.id, next));
      this.chatService.chatMaximizedEmitter.subscribe(isMaximized => {
        if (isMaximized) {
          this._areEnabled = true;
        }
      });
    } else if (this._selectedConversation.id === conversation.id) {
      this.unselectConversation();
    }
  }

  public onCloseConversation(isClosed: boolean) {
    if (isClosed) {
      if (!this._selectedConversation) {
        return;
      }
      if (this.chatService.draftMessage && this.chatService.draftMessage.content
        && this.chatService.draftMessage.content.trim() !== '') {
        this._draftMessages.set(this._selectedConversation.id, this.chatService.draftMessage);
      } else if (this._draftMessages.get(this._selectedConversation.id)) {
        this._draftMessages.set(this._selectedConversation.id, null);
      }
      this._selectedConversation = null;
    }
  }

  private getUnreadMessages() {
    // group unread messages by conversationId
    this.userService.getUnreadMessages(this.authService.currentUser.username)
      .subscribe(messages => messages.forEach(message => {
        if (this._unreadMessages.get(message.conversationId)) {
          if (this._unreadMessages.get(message.conversationId).findIndex(value => value.id === message.id) < 0) {
            this._unreadMessages.get(message.conversationId).unshift(message);
          }
        } else {
          this._unreadMessages.set(message.conversationId, []);
          this._unreadMessages.get(message.conversationId).unshift(message);
        }
      }));
  }

  public get hasUnreadMessages(): boolean {
    let hasUnreadMessages = false;
    this._unreadMessages.forEach((value) => hasUnreadMessages = hasUnreadMessages || (value && value.length > 0));
    return hasUnreadMessages;
  }

  public get unreadMessagesNumber(): number {
    let unreadMessagesNumber = 0;
    this._unreadMessages.forEach((value) => value ? unreadMessagesNumber += value.length : null);
    return unreadMessagesNumber;
  }

  private unselectConversation() {
    this.webSocketMessageService.disconnect();
    this.chatService.clearChat();
    this._selectedConversation = null;
  }
}
