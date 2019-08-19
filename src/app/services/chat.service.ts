import {EventEmitter, Injectable} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WebSocketMessageService} from './websocket/web-socket-message.service';
import {LocalStorageService} from './local-storage.service';
import {OutgoingMessage} from '../models/outgoing-message';
import {User} from '../models/user';
import {AuthService} from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private messageService: WebSocketMessageService,
    private storageService: LocalStorageService,
    private authService: AuthService
  ) {
  }

  private _pendingMessages: Message[] = [];
  private _draftMessage: OutgoingMessage;
  private _receiver: User;
  private _messages: Message[];
  private _conversation: Conversation;
  private _isMsgWindowMaximized = true;
  private _unreadMessages: Message[];
  readonly unreadMessagesEmitter = new EventEmitter<Message[]>();
  readonly conversationClosedEmitter = new EventEmitter<boolean>();
  readonly chatMaximizedEmitter = new EventEmitter<boolean>();

  get messages(): Message[] {
    return this._messages;
  }

  get conversation(): Conversation {
    return this._conversation;
  }

  set conversation(value: Conversation) {
    this._conversation = value;
  }

  get isMsgWindowMaximized(): boolean {
    return this._isMsgWindowMaximized;
  }

  set isMsgWindowMaximized(value: boolean) {
    this.chatMaximizedEmitter.emit(value);
    this._isMsgWindowMaximized = value;
  }

  get unreadMessages(): Message[] {
    if (!this._unreadMessages) {
      this._unreadMessages = [];
    }
    return this._unreadMessages;
  }

  get pendingMessages(): Message[] {
    return this._pendingMessages;
  }

  get loggedUsername(): string {
    return this.authService.currentUser.username;
  }

  get draftMessage(): OutgoingMessage {
    return this._draftMessage;
  }

  set draftMessage(value: OutgoingMessage) {
    this._draftMessage = value;
  }

  get receiver(): User {
    return this._receiver;
  }

  public static compareConversationsByTheLastMessage(conv1: Conversation, conv2: Conversation): number {
    if (!conv1.theLastMessage && !conv2.theLastMessage) {
      return 0;
    } else if (!conv1.theLastMessage) {
      return -1;
    } else if (!conv2.theLastMessage) {
      return 1;
    } else {
      ChatService.compareMessagesByDate(conv1.theLastMessage, conv2.theLastMessage);
    }
  }

  public static compareMessagesByDate(msg1: Message, msg2: Message): number {
    if (msg1.date.constructor.name === 'String') {
      msg1.date = new Date(msg1.date);
    }
    if (msg2.date.constructor.name === 'String') {
      msg2.date = new Date(msg2.date);
    }
    return msg1.date.getTime() - msg2.date.getTime();
  }

  private static isScrolledToBottom(): boolean {
    const elementById = document.getElementById('msg-container');
    // fixme: replace '30' with height of the last msg block
    return elementById.scrollHeight - elementById.scrollTop < elementById.offsetHeight + 30;
  }

  initialize(conversation: Conversation, isMsgWindowMaximized: boolean) {
    this.conversation = conversation;
    this.setReceiver(conversation);
    this.getMessages(conversation.id);
    this.isMsgWindowMaximized = isMsgWindowMaximized;
  }

  subscribeForNewMessages() {
    // console.log('%cinside subscribing for new message', 'color: blue; font-size: 20px;');
    this.messageService.subscribeForNewMessages(this.conversation.id, (newMessage: Message) => {
      if (!newMessage) {
        console.log('%cError: Incoming new message is null', 'color: red; font-size: 16px');
      }
      // check for message duplication
      if (this.messages[0].id !== newMessage.id) {
        // check for new message duplication
        if (this.unreadMessages && this.unreadMessages.length > 0 &&
          this.unreadMessages[0].id === newMessage.id) {
          console.log('%cError: trying to add already added new message.', 'color: red; font-size: 16px;');
          return;
        }
        if (newMessage.sender.username === LocalStorageService.username) {
          this.updateTemporaryPendingMessage(newMessage);
        } else {
          this.addIncomingMessage(newMessage);
        }
        this.draftMessage.parentMessageId = newMessage.id;
      } else {
        console.log('%cError: trying to add already added message:', 'color: red; font-size: 16px;');
        console.log(newMessage);
      }
    });
  }

  private addIncomingMessage(newMessage: Message) {
    if (ChatService.isScrolledToBottom()) {
      setTimeout(() => this.messageService
        .saveMessagesAsRead(this.conversation.id, LocalStorageService.username), 100);
      this.messages.unshift(newMessage);
      this.unreadMessagesEmitter.emit([]);
    } else {
      if (this._unreadMessages) {
        this._unreadMessages.unshift(newMessage);
      } else {
        this._unreadMessages = [];
        this._unreadMessages.unshift(newMessage);
        this.unreadMessagesEmitter.emit([newMessage]);
      }
    }
  }

  private updateTemporaryPendingMessage(newMessage: Message) {
    // find index of temporary message to replace
    const oldMessageIndex = this.messages.findIndex(message => {
      if (!message.parentMessageId) {
        return message.constructor.name === 'OutgoingMessage';
      }
      return (message.constructor.name === 'OutgoingMessage'
        && message.parentMessageId === newMessage.parentMessageId) || (message.id && message.id === newMessage.id);
    });
    if (oldMessageIndex < 0) {
      console.log('%cFound index less than 0 - message not found', 'color: red; font-size: 16px;');
    } else if (!this.messages[oldMessageIndex].id || this.messages[oldMessageIndex].id !== newMessage.id) {
      this.messages[oldMessageIndex] = newMessage;
    }
    // if there if another pending messages
    if (this.pendingMessages.length > 0) {
      const pendingMessage = this.pendingMessages.shift();
      console.log('%cSending next pending message', 'color: blue; font-size: 16px;');
      pendingMessage.parentMessageId = newMessage.id;
      this.messageService.sendPrivateMsg(pendingMessage);
    }
  }

  private getMessages(conversationId: number) {
    this.messageService.getMessagesForConversation(conversationId).subscribe((messages) => {
      this._messages = messages.reverse();
      document.getElementById('chat-input').focus();
      this.subscribeForNewMessages();
      this.messageService.saveMessagesAsRead(this.conversation.id, this.loggedUsername);
      this.unreadMessagesEmitter.emit([]);

      this.subscribeForReadMessagesUpdates(conversationId);
    });
  }

  subscribeForReadMessagesUpdates(conversationId: number) {
    this.messageService.subscribeForReadMessagesUpdates(conversationId, (readMessages: Message[]) => {
      readMessages.forEach(message => {
        const findIndex = this.messages.findIndex(value => value.id === message.id ||
          value.parentMessageId === message.parentMessageId);
        if (findIndex >= 0) {
          this.messages[findIndex] = message;
        } else {
          console.log('%cnot found...', 'color:red');
          console.log({message});
          console.log({messages: this.messages});
        }
        // if there is element in map with ID conversation.id, remove message from array by filter
        // otherwise create empty array
        this.unreadMessagesEmitter.emit(
          this.unreadMessages ?
            this.unreadMessages
              .filter(value => value.id !== message.id) : null);
      });
    });
  }

  private setReceiver(conversation: Conversation) {
    this._receiver = conversation.users[0].username !== LocalStorageService.username ?
      conversation.users[0] : conversation.users[1];
  }

  initDraftMessage() {
    this.draftMessage = new OutgoingMessage();
    this.draftMessage.conversationId = this.conversation.id;
    this.draftMessage.recipientUsername = this.conversation.users[0].username === this.loggedUsername ?
      this.conversation.users[1].username : this.conversation.users[0].username;
    this.draftMessage.senderUsername = this.conversation.users[0].username === this.loggedUsername ?
      this.conversation.users[0].username : this.conversation.users[1].username;
  }

  sendMessage() {
    if (this.messages && this.messages.length > 0) {
      this.draftMessage.parentMessageId = this.messages[0].id;
    } else if (!this.messages) {
      this._messages = [];
    }
    this.draftMessage.recipientUsername = this.receiver.username;
    this.draftMessage.conversationId = this.conversation.id;
    this.draftMessage.date = new Date();
    if (this.draftMessage.content && this.draftMessage.content.length > 0) {
      if (this.draftMessage.content.trim() === '') {
        this.draftMessage.content = '';
        return;
      } else if (this.messages.length === 0 || this.messages[0].constructor.name !== 'OutgoingMessage') {
        this.messageService.sendPrivateMsg(this.draftMessage);
      } else if (this.messages.length > 0) {
        this.pendingMessages.push(this.draftMessage);
      }
      this.messages.unshift(this.draftMessage);
    }
  }

  clearChat() {
    this.conversation = null;
    this._receiver = null;
    this._messages = null;
    this.messageService.disconnect();
  }
}
