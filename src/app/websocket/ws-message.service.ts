import {Injectable, OnDestroy} from '@angular/core';
import {Stomp} from 'stompjs/lib/stomp.js';
import * as SockJS from 'sockjs-client';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Conversation} from '../models/conversation';
import {OutgoingMessage} from '../models/outgoing-message';
import {Message} from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class WsMessageService implements OnDestroy {
  getMessagesURL = 'http://localhost:8080/chat/messages-for-';
  getConversationsURL = 'http://localhost:8080/chat/conversations-for-';
  private conversationsSocket;
  private messagesSocket;
  private conversationsStompClient: any;
  private messagesStompClient: any;

  constructor(
    private tokenStorage: TokenStorageService,
    private http: HttpClient
  ) {
  }

  private initStompForConversations(callback) {
    this.conversationsSocket = new SockJS('http://localhost:8080/conversation-web-socket');
    // const socket = new WebSocket('ws://' + this.conversationsURL);
    this.conversationsStompClient = Stomp.over(this.conversationsSocket);
    // console.log('%cshit', 'color:blue; font-size:16px');
    // this.messagesStompClient.debug = () => {}; // fixme: disable log
    this.conversationsStompClient.connect({}, () => {
      this.conversationsStompClient.debug = () => {
      };
      callback();
    });
  }

  private initStompForMessages(callback) {
    this.messagesSocket = new SockJS('http://localhost:8080/message-web-socket');
    // const socket = new WebSocket('ws://' + this.messagesURL);
    this.messagesStompClient = Stomp.over(this.messagesSocket);
    // this.messagesStompClient.debug = null; // disable log

    this.messagesStompClient.connect({}, () => {
      this.messagesStompClient.debug = () => {
      };
      callback();
    });
  }

  getConversations(username: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.getConversationsURL + username);
  }

  getMessagesForConversation(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(this.getMessagesURL + conversationId);
  }

  createConversationIfNotExists(receiverId: number): Observable<Conversation> {
    const params = new HttpParams().set('friendId', receiverId.toString());
    return this.http.post<Conversation>('http://localhost:8080/goto-conversation', params);
  }

  sendPrivateMsg(msg: OutgoingMessage) {
    if (!msg.content) {
      console.error('can not send empty message');
      return;
    } else if (msg.content.trim().length > 0) {
      console.error('message was trimmed');
      return;
    } else if (msg.content.trim() === '') {
      console.error('message was trimmed');
      return;
    }
    this.checkMessagesWsAndExecute(() => {
      this.messagesStompClient.send('/message/private-message', {}, JSON.stringify(
        {
          content: msg.content,
          senderUsername: msg.senderUsername,
          recipientUsername: msg.recipientUsername,
          conversationId: msg.conversationId
        }));
    });
  }

  subscribeForNewMessages(conversationId: number, callback) {
    this.checkMessagesWsAndExecute(() => {
      // console.log('%cSubscribing to new messages', 'color: blue');
      this.messagesStompClient.subscribe('/chat/private-messages-for-conversation-id' + conversationId,
        answer => callback(JSON.parse(answer.body) as Message));
    });
  }

  subscribeForConversationsUpdates(username: string, callback) {
    this.checkConversationsWsAndExecute(() => {
      // console.log('%cSubscribing to conversation updates', 'color: blue');
      this.conversationsStompClient.subscribe('/chat/update-conversation-for-' + username,
        answer => callback(JSON.parse(answer.body) as Conversation));
    });
  }

  subscribeForReadMessagesUpdates(conversationId: number, callback: Function): void {
    this.checkMessagesWsAndExecute(() => {
      // console.log('%cSubscribing to read messages updates', 'color: blue');
      this.messagesStompClient.subscribe('/chat/get-read-messages-in-conversation-' + conversationId,
        answer => callback(JSON.parse(answer.body) as Message));
    });
  }

  saveMessagesAsRead(conversationId: number, username: string) {
    this.checkMessagesWsAndExecute(() => {
      console.log('%cSaving message as read', 'color: blue');
      this.messagesStompClient.send('/message/set-messages-as-read-in-conversation-' + conversationId + '-for-' + username,
        {}, JSON.stringify({}));
    });
  }

  checkMessagesWsAndExecute(callback) {
    if (!this.messagesStompClient) {
      this.initStompForMessages(() => this.checkMessagesWsAndExecute(callback));
    } else if (this.messagesSocket.readyState === SockJS.CONNECTING || this.messagesSocket.readyState === SockJS.CLOSING) {
      // console.log(this.messagesSocket);
      setTimeout(() => this.checkMessagesWsAndExecute(callback), 100);
    } else if (this.messagesSocket.readyState === SockJS.CLOSED) {
      this.initStompForMessages(() => this.checkMessagesWsAndExecute(callback));
    } else if (this.messagesSocket.readyState === SockJS.OPEN) {
      callback();
    }
  }

  checkConversationsWsAndExecute(callback) {
    if (!this.conversationsStompClient) {
      this.initStompForConversations(() => this.checkConversationsWsAndExecute(callback));
    } else if (this.conversationsSocket.readyState === SockJS.CONNECTING || this.conversationsSocket.readyState === SockJS.CLOSING) {
      // console.log(this.conversationsSocket);
      setTimeout(() => this.checkConversationsWsAndExecute(callback), 100);
    } else if (this.conversationsSocket.readyState === SockJS.CLOSED) {
      this.initStompForMessages(() => this.checkConversationsWsAndExecute(callback));
    } else if (this.conversationsSocket.readyState === SockJS.OPEN) {
      callback();
    }
  }

  conversationsDisconnect() {
    this.conversationsStompClient.disconnect();
  }

  messagesDisconnect() {
    this.messagesStompClient.disconnect();
  }

  ngOnDestroy() {
    this.conversationsStompClient.disconnect();
    this.messagesStompClient.disconnect();
  }


  // todo: reconnect

  // todo: fix messages duplications receiving
}
