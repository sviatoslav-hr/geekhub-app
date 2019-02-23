import {Injectable, OnDestroy} from '@angular/core';
import {Stomp} from 'stompjs/lib/stomp.js';
import * as SockJS from 'sockjs-client';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Conversation} from '../models/conversation';
import {OutgoingMessage} from '../models/outgoing-message';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Injectable({
  providedIn: 'root'
})
export class WsMessageService implements OnDestroy {
  conversationsURL = 'localhost:8080/conversation-web-socket';
  messagesURL = 'localhost:8080/message-web-socket';
  private conversationsStompClient: any;
  private messagesStompClient: any;

  constructor(
    private tokenStorage: TokenStorageService,
    private http: HttpClient
  ) {
  }

  private initStompForConversations() {
    const socket = new SockJS('http://' + this.conversationsURL);
    // const socket = new WebSocket('ws://' + this.conversationsURL);
    this.conversationsStompClient = Stomp.over(socket);
  }

  private initStompForMessages() {
    const socket = new SockJS('http://' + this.messagesURL);
    // const socket = new WebSocket('ws://' + this.messagesURL);
    this.messagesStompClient = Stomp.over(socket);
  }

  getConversations(username: string, callback) {
    this.initStompForConversations();

    this.conversationsStompClient.connect({}, () => {
      this.conversationsStompClient.subscribe('/chat/requested-conversations-for-' + username,
        answer => callback(answer), error => console.log(error));
      this.conversationsStompClient.send('/conversation/conversations-request-for-' + username, {}, JSON.stringify({}));
    }, error => console.log(error));
  }

  getMessagesForConversation(conversationId: number, callback) {
    this.initStompForMessages();

    this.messagesStompClient.connect({}, () => {

      this.messagesStompClient.subscribe('/chat/messages-list-for-conversation-id' + conversationId,
        answer => callback(JSON.parse(answer.body)));
      this.messagesStompClient.send('/message/messages-for-conversation-id' + conversationId, {}, JSON.stringify({}));
    });
  }

  createConversationIfNotExists(receiverId: number): Observable<Conversation> {
    const params = new HttpParams().set('friendId', receiverId.toString());
    return this.http.post<Conversation>('http://localhost:8080/goto-conversation', params);
  }

  sendPrivateMsg(msg: OutgoingMessage) {
    if (!msg.content) {
      console.error('can not send empty message');
      return;
    }
    if (!this.messagesStompClient) {
      this.initStompForMessages();
      const content = msg.content;
      this.messagesStompClient.connect({}, () => {
        msg.content = content;
        this.messagesStompClient.send('/message/private-message', {}, JSON.stringify(
          {
            content: msg.content,
            senderUsername: msg.senderUsername,
            recipientUsername: msg.recipientUsername,
            conversationId: msg.conversationId
          }));
      });
    } else {
      this.messagesStompClient.send('/message/private-message', {}, JSON.stringify(
        {
          content: msg.content,
          senderUsername: msg.senderUsername,
          recipientUsername: msg.recipientUsername,
          conversationId: msg.conversationId
        }));
    }
  }

  subscribeForNewMessages(conversationId: number, callback) {
    this.messagesStompClient.subscribe('/chat/private-messages-for-conversation-id' + conversationId,
      answer => callback(JSON.parse(answer.body)));
  }

  subscribeForConversations(username: string, callback) {
    this.conversationsStompClient.subscribe('/chat/update-conversation-for-' + username,
      answer => callback(JSON.parse(answer.body)));
  }

  subscribeForReadMessagesUpdates(conversationId: number, callback) {
    this.messagesStompClient.subscribe('/chat/get-read-messages-in-conversation-' + conversationId,
      answer => callback(JSON.parse(answer.body)));
  }

  saveMessagesAsRead(conversationId: number, username: string) {
    this.messagesStompClient.send('/message/set-messages-as-read-in-conversation-' + conversationId + '-for-' + username,
      {}, JSON.stringify({}));
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
