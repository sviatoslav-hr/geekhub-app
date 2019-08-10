import {Injectable} from '@angular/core';
import {LocalStorageService} from '../local-storage.service';
import {HttpClient} from '@angular/common/http';
import * as SockJS from 'sockjs-client';
import {Observable} from 'rxjs';
import {Conversation} from '../../models/conversation';
import {WebSocketService} from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketConversationsService extends WebSocketService {
  getConversationsURL = 'http://localhost:8080/chat/conversations-for-';

  constructor(
    private tokenStorage: LocalStorageService,
    private http: HttpClient
  ) {
    super('http://localhost:8080/conversation-web-socket');
  }

  getConversations(username: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.getConversationsURL + username);
  }

  subscribeForConversationsUpdates(username: string, callback) {
    if (this.cLog >= 2) {
      console.log('%cSubscribing for conversations updates', 'color:purple');
    }
    this.checkConversationsWsAndExecute(() => {
      // console.log('%cSubscribing to conversation updates', 'color: blue');
      this.stompClient.subscribe('/chat/update-conversation-for-' + username,
        answer => callback(JSON.parse(answer.body) as Conversation));
    });
  }

  checkConversationsWsAndExecute(callback) {
    if (!this.stompClient) {
      if (this.cLog >= 1) {
        console.log('%cInitialising Conversations StompClient', 'color:blue');
      }
      this.initStompClient(() => this.checkConversationsWsAndExecute(callback));
    } else if (this.webSocket.readyState === SockJS.CONNECTING || this.webSocket.readyState === SockJS.CLOSING) {
      if (this.cLog >= 1) {
        console.log('%cWait, Conversations WebSocket is ' +
          (this.webSocket.readyState === 0 ? 'connecting' : 'closing') + '!', 'color:blue');
      }
      // console.log(this.conversationsSocket);
      setTimeout(() => this.checkConversationsWsAndExecute(callback), 100);
    } else if (this.webSocket.readyState === SockJS.CLOSED) {
      if (this.cLog >= 1) {
        console.log('%cConversations WebSocket is closed!', 'color:blue');
      }
      this.initStompClient(() => this.checkConversationsWsAndExecute(callback));
    } else if (this.webSocket.readyState === SockJS.OPEN) {
      if (this.cLog >= 1) {
        console.log('%cConversations WebSocket is open!', 'color:blue');
      }
      callback();
    }
  }
}
