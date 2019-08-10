import {Injectable} from '@angular/core';
import * as SockJS from 'sockjs-client';
import {LocalStorageService} from '../local-storage.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Conversation} from '../../models/conversation';
import {OutgoingMessage} from '../../models/outgoing-message';
import {Message} from '../../models/message';
import {WebSocketService} from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketMessageService extends WebSocketService {
  getMessagesURL = 'http://localhost:8080/chat/messages-for-';

  constructor(
    private tokenStorage: LocalStorageService,
    private http: HttpClient
  ) {
    super('http://localhost:8080/message-web-socket');
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
      console.error('Can not send empty message.');
      return;
    }
    if (this.cLog >= 2) {
      console.log('%cSending private message', 'color:purple');
    }
    this.checkMessagesWsAndExecute(() => {
      this.stompClient.send('/message/private-message', {}, JSON.stringify(
        {
          content: msg.content,
          senderUsername: msg.senderUsername,
          recipientUsername: msg.recipientUsername,
          conversationId: msg.conversationId
        }));
    });
  }

  subscribeForNewMessages(conversationId: number, callback) {
    if (this.cLog >= 2) {
      console.log('%cSubscribing to new messages', 'color:purple');
    }
    this.checkMessagesWsAndExecute(() => {
      // console.log('%cSubscribing to new messages', 'color: blue');
      this.stompClient.subscribe('/chat/private-messages-for-conversation-id' + conversationId,
        answer => callback(JSON.parse(answer.body) as Message));
    });
  }

  subscribeForReadMessagesUpdates(conversationId: number, callback: Function): void {
    if (this.cLog >= 2) {
      console.log('%cSubscribing for read messages updates', 'color:purple');
    }
    this.checkMessagesWsAndExecute(() => {
      this.stompClient.subscribe('/chat/get-read-messages-in-conversation-' + conversationId,
        answer => callback(JSON.parse(answer.body) as Message));
    });
  }

  saveMessagesAsRead(conversationId: number, username: string) {
    if (this.cLog >= 2) {
      console.log('%cSaving message as read', 'color:purple');
    }
    this.checkMessagesWsAndExecute(() => {
      this.stompClient.send('/message/set-messages-as-read-in-conversation-' + conversationId + '-for-' + username,
        {}, JSON.stringify({}));
    });
  }

  checkMessagesWsAndExecute(callback) {
    if (!this.stompClient) {
      if (this.cLog >= 1) {
        console.log('%cInitialising Messages StompClient', 'color:green');
      }
      this.initStompClient(() => this.checkMessagesWsAndExecute(callback));
    } else if (this.webSocket.readyState === SockJS.CONNECTING || this.webSocket.readyState === SockJS.CLOSING) {
      if (this.cLog >= 1) {
        console.log('%cWait, Messages WebSocket is ' +
          (this.webSocket.readyState === 0 ? 'connecting' : 'closing') + '!', 'color:green');
      }
      setTimeout(() => this.checkMessagesWsAndExecute(callback), 100);
    } else if (this.webSocket.readyState === SockJS.CLOSED) {
      if (this.cLog >= 1) {
        console.log('%cMessages WebSocket is closed!', 'color:green');
      }
      this.initStompClient(() => this.checkMessagesWsAndExecute(callback));
    } else if (this.webSocket.readyState === SockJS.OPEN) {
      if (this.cLog >= 1) {
        console.log('%cMessages WebSocket is open!', 'color:green');
      }
      callback();
    }
  }
}
