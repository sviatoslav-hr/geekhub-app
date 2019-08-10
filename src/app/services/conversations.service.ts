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

  constructor(
    private webSocketConversationsService: WebSocketConversationsService,
    private webSocketMessageService: WebSocketMessageService,
    private storageService: LocalStorageService,
    private chatService: ChatService,
    private userService: UserService,
    private authService: AuthService
  ) {
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

  public loadConversations() {
    this.getConversations();
    this.getUnreadMessages();
  }

  public clearConversations() {
    if (this.chatService.isMsgWindowMaximized) {
      this.chatService.clearChat();
      this._selectedConversation = null;
    }
    this._conversations = null;
    this.webSocketConversationsService.disconnect();
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
      this.subscribeForUpdates();
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
  }

  public openConversation(conversation: Conversation) {
    if (!this._selectedConversation || this._selectedConversation.id !== conversation.id) {
      if (this._selectedConversation) {
        this.webSocketMessageService.disconnect();
        this.chatService.clearChat();
        this._selectedConversation = null;
      }
      LocalStorageService.selectedConversationId = conversation.id;
      this._selectedConversation = conversation;
      this.chatService.initialize(conversation, true);
      if (this._draftMessages.get(conversation.id)) {
        this.chatService.draftMessage = this._draftMessages.get(conversation.id);
      } else {
        this.chatService.initDraftMessage();
      }
      this.chatService.conversationClosed.subscribe(next =>
        this.onCloseConversation(next));
      this.chatService.unreadMessagesEmitter.subscribe(next =>
        this._unreadMessages.set(conversation.id, next));
    }
  }

  private onCloseConversation(isClosed: boolean) {
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
}
