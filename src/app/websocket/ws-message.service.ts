import {Injectable, OnDestroy} from '@angular/core';
import {Stomp} from 'stompjs/lib/stomp.js';
import * as SockJS from 'sockjs-client';
// import SockJS = require('sockjs-client');
import {Message} from '../models/message';
import {TokenStorageService} from '../services/auth/token-storage.service';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable({
  providedIn: 'root'
})
export class WsMessageService implements OnDestroy {
  serverURL = 'localhost:8080/conversation-web-socket';
  private stompClient: any;

  constructor(
    private tokenStorage: TokenStorageService
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

  ngOnDestroy() {
    this.stompClient.disconnect();
  }

  disconnect() {
    this.stompClient.disconnect();
  }

}
