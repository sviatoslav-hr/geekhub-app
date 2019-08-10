import {Stomp} from 'stompjs/lib/stomp';
import * as SockJS from 'sockjs-client';
import {OnDestroy} from '@angular/core';

export abstract class WebSocketService implements OnDestroy {
  private readonly connectionUrl: string;
  private _webSocket;
  private _stompClient: any;
  protected cLog = 2;

  /*
    0 - console.log disabled
    1 - console.log enabled only for checkAndExecute methods
    2 - console.log enabled for checkAndExecute, subscribe and send methods
    3 - console.log enabled for all methods
   */

  get webSocket() {
    return this._webSocket;
  }

  get stompClient(): any {
    return this._stompClient;
  }


  protected constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
  }

  protected initStompClient(callback) {
    if (this.cLog === 3) {
      console.log('%cInitialization WebSocket...\n' + this.connectionUrl, 'color:pink');
    }
    this._webSocket = new SockJS(this.connectionUrl);
    this._stompClient = Stomp.over(this.webSocket);
    // this.stompClient.debug = null; // disable log

    this.stompClient.connect({}, () => {
      this.stompClient.debug = () => {
      };
      callback();
    });
  }

  ngOnDestroy() {
    this.disconnect();
  }

  disconnect() {
    if (this.cLog >= 1) {
      console.log('%cWebSocket disconnecting...\n' + this.connectionUrl, 'color:red');
    }
    this.stompClient.disconnect();
  }
}
