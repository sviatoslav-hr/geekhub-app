import {EventEmitter, Injectable} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from './websocket/ws-message.service';
import {TokenStorageService} from './auth/token-storage.service';
import {OutgoingMessage} from '../models/outgoing-message';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private _pendingMessages: Message[] = [];
  private _loggedUsername: string;
  private _draftMessage: OutgoingMessage;
  private _receiver: User;
  private _messages: Message[];
  private _conversation: Conversation;
  private _isMsgWindowMaximized = true;
  private _unreadMessages: Message[];
  unreadMessagesEmitter = new EventEmitter<Message[]>();
  conversationClosed = new EventEmitter<boolean>();

  constructor(
    private wsMessageService: WsMessageService,
    private storageService: TokenStorageService
  ) {
  }


  get messages(): Message[] {
    return this._messages;
  }

  set messages(value: Message[]) {
    this._messages = value;
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
    this._isMsgWindowMaximized = value;
  }

  get unreadMessages(): Message[] {
    return this._unreadMessages;
  }

  set unreadMessages(value: Message[]) {
    this._unreadMessages = value;
  }

  get pendingMessages(): Message[] {
    return this._pendingMessages;
  }

  set pendingMessages(value: Message[]) {
    this._pendingMessages = value;
  }

  get loggedUsername(): string {
    return this._loggedUsername;
  }

  set loggedUsername(value: string) {
    this._loggedUsername = value;
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

  set receiver(value: User) {
    this._receiver = value;
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

  init(conversation: Conversation, isMsgWindowMaximized: boolean) {
    this.loggedUsername = this.storageService.getUsername();
    this.conversation = conversation;
    this.setReceiver(conversation);
    this.getMessages(conversation.id);
    this.isMsgWindowMaximized = isMsgWindowMaximized;
  }

  subscribeForNewMessages() {
    // console.log('%cinside subscribing for new message', 'color: blue; font-size: 20px;');
    // fixme: websocket subscribes from anonymous window to current
    this.wsMessageService.subscribeForNewMessages(this.conversation.id, (newMessage: Message) => {
      if (!newMessage) {
        console.log('%cError: Incoming new message is null', 'color: red; font-size: 16px');
      }
      console.log(newMessage);
      const loggedUsername = this.storageService.getUsername();
      // check for message duplication
      if (this.messages[0].id !== newMessage.id) {
        // check for new message duplication
        if (this.unreadMessages && this.unreadMessages.length > 0 &&
          this.unreadMessages[0].id === newMessage.id) {
          console.log('%cError: trying to add already added new message.', 'color: red; font-size: 16px;');
          return;
        }
        // if message was sent by loggedUser, replace temporary message
        if (newMessage.sender.username === loggedUsername) {
          // find index of pending message to replace
          const oldMessageIndex = this.messages.findIndex(message => {
            if (!message.parentMessageId && message.constructor.name !== 'OutgoingMessage') {
              return false;
            }
            return (message.constructor.name === 'OutgoingMessage'
              && message.parentMessageId === newMessage.parentMessageId) || (message.id && message.id === newMessage.id);
          });
          if (oldMessageIndex < 0) {
            console.log('Found index less than 0 - message not found');
          } else if (!this.messages[oldMessageIndex].id || this.messages[oldMessageIndex].id !== newMessage.id) {
            this.messages[oldMessageIndex] = newMessage;
          }
          // if there if another pending messages
          if (this.pendingMessages.length > 0) {
            const firstPendingMsg = this.pendingMessages.shift();
            console.log('%cSending next pending message', 'color: blue; font-size: 16px;');
            console.log(newMessage);
            console.log(firstPendingMsg);
            firstPendingMsg.parentMessageId = newMessage.id;
            this.wsMessageService.sendPrivateMsg(firstPendingMsg);
          }

        } else {
          const elementById = document.getElementById('msg-container');
          // if messages was scrolled to bottom
          // fixme: replace '30' with height of the last msg block
          if (elementById.scrollHeight - elementById.scrollTop < elementById.offsetHeight + 30) {
            setTimeout(() => this.wsMessageService.saveMessagesAsRead(this.conversation.id, loggedUsername), 100);
            this.messages.unshift(newMessage);
          } else {
            this.unreadMessages ?
              this.unreadMessages.unshift(newMessage) :
              this.unreadMessagesEmitter.emit([newMessage]);
          }
        }
        this.draftMessage.parentMessageId = newMessage.id;
      } else {
        console.log('%cError: trying to add already added message:', 'color: red; font-size: 16px;');
        console.log(newMessage);
      }
    });
  }

  private getMessages(conversationId: number) {
    this.wsMessageService.getMessagesForConversation(conversationId).subscribe((messages) => {
      this.subscribeForNewMessages();

      document.getElementById('chat-input').focus();

      this.messages = messages.reverse();

      if (this.unreadMessages && this.unreadMessages.length > 0) {
        this.wsMessageService.saveMessagesAsRead(this.conversation.id, this.loggedUsername);
      }
      // if (this.unreadMessages.get(this.selectedConversation.id)) {
      //   this.unreadMessages.get(this.selectedConversation.id).forEach(newMessage => this.messages.unshift(newMessage));
      // }
      this.unreadMessagesEmitter.emit([]);

      this.subscribeForReadMessagesUpdates(conversationId);
    });
  }

  subscribeForReadMessagesUpdates(conversationId: number) {
    this.wsMessageService.subscribeForReadMessagesUpdates(conversationId, (readMessages: Message[]) => {
      console.log('%cUpdating read messages', 'color:blue');
      console.log(readMessages);
      // console.log(this.unreadMessages.get(conversation.id));
      // console.log(this.messages.filter(value => value.constructor.name === 'OutgoingMessage'));
      // console.log(this.messages.filter(value => value.constructor.name !== 'OutgoingMessage'));
      readMessages.forEach(message => {
        const findIndex = this.messages.findIndex(value => value.id === message.id ||
          value.parentMessageId === message.parentMessageId);
        if (findIndex >= 0) {
          console.log('%creplacing...', 'color:blue');
          // console.log(message);
          // console.log(this.messages[findIndex]);
          this.messages[findIndex] = message;
        } else {
          console.log('%cnot found...', 'color:red');
          console.log(message);
          console.log(this.messages);
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
    this.receiver = conversation.users[0].username !== this.storageService.getUsername() ?
      conversation.users[0] : conversation.users[1];
    console.log(this.receiver);
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
    console.log(this.draftMessage);
    if (this.messages && this.messages.length > 0) {
      this.draftMessage.parentMessageId = this.messages[0].id;
    } else if (!this.messages) {
      this.messages = [];
    }
    if (this.draftMessage.recipientUsername !== this.receiver.username ||
      this.draftMessage.conversationId !== this.conversation.id) {
      this.draftMessage.recipientUsername = this.receiver.username;
      this.draftMessage.conversationId = this.conversation.id;
    }
    this.draftMessage.date = new Date();
    if (this.draftMessage.content && this.draftMessage.content.length > 0) {
      if (this.draftMessage.content.trim() === '') {
        this.draftMessage.content = '';
        return;
      } else if (this.messages.length === 0 || this.messages[0].constructor.name !== 'OutgoingMessage') {
        this.wsMessageService.sendPrivateMsg(this.draftMessage);
      } else if (this.messages.length > 0) {
        this.pendingMessages.push(this.draftMessage);
      }
      this.messages.unshift(this.draftMessage);
    }
  }
}
