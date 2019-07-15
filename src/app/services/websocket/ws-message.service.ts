import {Injectable, OnDestroy} from '@angular/core';
import {Stomp} from 'stompjs/lib/stomp.js';
import * as SockJS from 'sockjs-client';
import {LocalStorageService} from '../local-storage.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Conversation} from '../../models/conversation';
import {OutgoingMessage} from '../../models/outgoing-message';
import {Message} from '../../models/message';

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
  private cLog = 2;
  /*
    0 - console.log disabled
    1 - console.log enabled only for checkAndExecute methods
    2 - console.log enabled for checkAndExecute, subscribe and send methods
    3 - console.log enabled for all methods
   */

  constructor(
    private tokenStorage: LocalStorageService,
    private http: HttpClient
  ) {
  }

  private initStompForConversations(callback) {
    if (this.cLog === 3) {
      console.log('%cInside initialization Conversations WebSocket', 'color:pink');
    }
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
    if (this.cLog === 3) {
      console.log('%cInside initialization Messages WebSocket', 'color:pink');
    }
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
      console.error('Can not send empty message.');
      return;
    }
    if (this.cLog >= 2) {
      console.log('%cSending private message', 'color:purple');
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
    if (this.cLog >= 2) {
      console.log('%cSubscribing to new messages', 'color:purple');
    }
    this.checkMessagesWsAndExecute(() => {
      // console.log('%cSubscribing to new messages', 'color: blue');
      this.messagesStompClient.subscribe('/chat/private-messages-for-conversation-id' + conversationId,
        answer => callback(JSON.parse(answer.body) as Message));
    });
  }

  subscribeForConversationsUpdates(username: string, callback) {
    if (this.cLog >= 2) {
      console.log('%cSubscribing for conversations updates', 'color:purple');
    }
    this.checkConversationsWsAndExecute(() => {
      // console.log('%cSubscribing to conversation updates', 'color: blue');
      this.conversationsStompClient.subscribe('/chat/update-conversation-for-' + username,
        answer => callback(JSON.parse(answer.body) as Conversation));
    });
  }

  subscribeForReadMessagesUpdates(conversationId: number, callback: Function): void {
    if (this.cLog >= 2) {
      console.log('%cSubscribing for read messages updates', 'color:purple');
    }
    this.checkMessagesWsAndExecute(() => {
      this.messagesStompClient.subscribe('/chat/get-read-messages-in-conversation-' + conversationId,
        answer => callback(JSON.parse(answer.body) as Message));
    });
  }

  saveMessagesAsRead(conversationId: number, username: string) {
    if (this.cLog >= 2) {
      console.log('%cSaving message as read', 'color:purple');
    }
    this.checkMessagesWsAndExecute(() => {
      this.messagesStompClient.send('/message/set-messages-as-read-in-conversation-' + conversationId + '-for-' + username,
        {}, JSON.stringify({}));
    });
  }

  checkMessagesWsAndExecute(callback) {
    if (!this.messagesStompClient) {
      if (this.cLog >= 1) {
        console.log('%cInitialising Messages StompClient', 'color:green');
      }
      this.initStompForMessages(() => this.checkMessagesWsAndExecute(callback));
    } else if (this.messagesSocket.readyState === SockJS.CONNECTING || this.messagesSocket.readyState === SockJS.CLOSING) {
      if (this.cLog >= 1) {
        console.log('%cWait, Messages WebSocket is ' +
          (this.messagesSocket.readyState === 0 ? 'connecting' : 'closing') + '!', 'color:green');
      }
      setTimeout(() => this.checkMessagesWsAndExecute(callback), 100);
    } else if (this.messagesSocket.readyState === SockJS.CLOSED) {
      if (this.cLog >= 1) {
        console.log('%cMessages WebSocket is closed!', 'color:green');
      }
      this.initStompForMessages(() => this.checkMessagesWsAndExecute(callback));
    } else if (this.messagesSocket.readyState === SockJS.OPEN) {
      if (this.cLog >= 1) {
        console.log('%cMessages WebSocket is open!', 'color:green');
      }
      callback();
    }
  }

  checkConversationsWsAndExecute(callback) {
    if (!this.conversationsStompClient) {
      if (this.cLog >= 1) {
        console.log('%cInitialising Conversations StompClient', 'color:blue');
      }
      this.initStompForConversations(() => this.checkConversationsWsAndExecute(callback));
    } else if (this.conversationsSocket.readyState === SockJS.CONNECTING || this.conversationsSocket.readyState === SockJS.CLOSING) {
      if (this.cLog >= 1) {
        console.log('%cWait, Conversations WebSocket is ' +
          (this.conversationsSocket.readyState === 0 ? 'connecting' : 'closing') + '!', 'color:blue');
      }
      // console.log(this.conversationsSocket);
      setTimeout(() => this.checkConversationsWsAndExecute(callback), 100);
    } else if (this.conversationsSocket.readyState === SockJS.CLOSED) {
      if (this.cLog >= 1) {
        console.log('%cConversations WebSocket is closed!', 'color:blue');
      }
      this.initStompForConversations(() => this.checkConversationsWsAndExecute(callback));
    } else if (this.conversationsSocket.readyState === SockJS.OPEN) {
      if (this.cLog >= 1) {
        console.log('%cConversations WebSocket is open!', 'color:blue');
      }
      callback();
    }
  }

  conversationsDisconnect() {
    if (this.cLog >= 1) {
      console.log('%cConversations WebSocket was disconnected!', 'color:red');
    }
    this.conversationsStompClient.disconnect();
  }

  messagesDisconnect() {
    if (this.cLog >= 1) {
      console.log('%cMessages WebSocket was disconnected!', 'color:red');
    }
    this.messagesStompClient.disconnect();
  }

  ngOnDestroy() {
    if (this.cLog >= 1) {
      console.log('%cConversations and Messages WebSockets were disconnected!', 'color:red');
    }
    this.conversationsStompClient.disconnect();
    this.messagesStompClient.disconnect();
  }


  // todo: reconnect

  // todo: fix messages duplications receiving
}
