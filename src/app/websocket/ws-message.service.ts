import {Injectable, OnDestroy} from '@angular/core';
import {Stomp} from 'stompjs/lib/stomp.js';
import * as SockJS from 'sockjs-client';
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
  }

  private init() {
    const socket = new SockJS('http://' + this.serverURL);
    // const socket = new WebSocket('ws://' + this.serverURL);
    this.stompClient = Stomp.over(socket);
  }

  getConversations(username: string, callback) {
    this.init();

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe('/chat/requested-conversations-for-' + username, answer => callback(answer), error => console.log(error));
      this.conversationRequest(username);

    }, error => console.log(error));
  }

  getMessages(conversationId: number, callback) {
    const socket = new SockJS('http://localhost:8080/message-web-socket');
    const stompMsg = Stomp.over(socket);
    stompMsg.connect({}, () => {

      stompMsg.subscribe('/chat/messages-list-for-conversation-id' + conversationId, answer => callback(JSON.parse(answer.body)));
      stompMsg.send('/message/messages-for-conversation-id' + conversationId, {}, JSON.stringify({}));
    });
  }

  private conversationRequest(username: string) {
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
    if (!msg.content) {
      console.error('can not send empty message');
      return;
    }

    const socket = new SockJS('http://localhost:8080/message-web-socket');
    const stompMsg = Stomp.over(socket);
    const content = msg.content;
    stompMsg.connect({}, () => {
      msg.content = content;
      stompMsg.send('/message/private-message', {}, JSON.stringify(
        {
          content: msg.content,
          senderUsername: msg.senderUsername,
          recipientUsername: msg.recipientUsername,
          conversationId: msg.conversationId
        }));
    });

  }

  subscribeForConversations(username: string, callback) {
    this.stompClient.subscribe('/chat/update-conversation-for-' + username, answer => callback(JSON.parse(answer.body)));
  }


  // todo: reconnect

  // todo: fix trouble when ws stuck on 'Opening WebSocket'
}
