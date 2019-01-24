import {Injectable, OnDestroy} from '@angular/core';
import {Stomp} from 'stompjs/lib/stomp.js';
import * as SockJS from 'sockjs-client';
// import SockJS = require('sockjs-client');
import {Message} from '../models/message';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Conversation} from '../models/conversation';
import {IncomingMessage} from '../models/incoming-message';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable({
  providedIn: 'root'
})
export class WsMessageService implements OnDestroy {
  serverURL = 'localhost:8080/conversation-web-socket';
  private privateMsg = '/message/private-message';
  private stompClient: any;

  constructor(
    private tokenStorage: TokenStorageService,
    private http: HttpClient
  ) {
    const socket = new SockJS('http://' + this.serverURL);
    // const socket = new WebSocket('ws://' + this.serverURL);
    this.stompClient = Stomp.over(socket);
  }


  getConversations(username: string, callback) {
    // TOKEN_HEADER_KEY: 'Bearer ' + this.tokenStorage.getToken()
    // const headers = {'/conversation-web-socket': {'target': 'http://localhost:8080', 'secure': false, 'ws': true, 'logLevel': 'debug'}};
    this.stompClient.connect({}, () => {
      console.log('WS: Successfully connected to ConversationWS');
      // following the channel
      this.stompClient.subscribe('/chat/conversations-list-for-' + username, answer => callback(answer), error => console.log(error));
      this.conversationRequest(username);

    }, error => console.log(error));
  }

  getMessages(conversationId: number): Message[] {
    const socket = new SockJS('http://localhost:8080/message-web-socket');
    const stompMsg = Stomp.over(socket);

    let messages: Message[];
    stompMsg.connect({}, () => {
      console.log('WS: Successfully connected to MessageWS');
      stompMsg.subscribe('/chat/messages-list-for-conversation-id' + conversationId, answer => {
        messages = answer;
      });
      console.log('getting messages');
      stompMsg.send('/message/messages-for-conversation-id' + conversationId, {}, JSON.stringify({}));
    });
    return messages;
  }

  private conversationRequest(username: string) {
    console.log('LOADING CONVERSATIONS...');
    this.stompClient.send('/conversation/conversations-request-for-' + username, {}, JSON.stringify({}));
  }

  createConversationIfNotExists(receiverId: number): Observable<Conversation> {
    const params = new HttpParams().set('friendId', receiverId.toString());
    return this.http.post<Conversation>('http://localhost:8080/goto-conversation', params);
  }

  ngOnDestroy() {
    this.stompClient.disconnect();
  }

  disconnect() {
    this.stompClient.disconnect();
  }

  sendPrivateMsg(msg: IncomingMessage) {
    const socket = new SockJS('http://localhost:8080/message-web-socket');
    const stompMsg = Stomp.over(socket);

    console.log(msg);

    stompMsg.connect({}, () => {
      stompMsg.send('/message/private-message', {}, JSON.stringify(
        {
          content: msg.content,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          conversationId: msg.conversationId
        }));
    });
  }

}
