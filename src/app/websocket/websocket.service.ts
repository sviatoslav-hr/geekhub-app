import {Injectable, OnDestroy, Inject} from '@angular/core';
import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/webSocket';
import {IWebsocketService, IWsMessage, WebSocketConfig} from './websocket.interfaces';
import {Observable, SubscriptionLike, Subject, Observer, interval} from 'rxjs';
import {share, distinctUntilChanged, takeWhile, filter, map} from 'rxjs/operators';
import {config} from './websocket.config';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements IWebsocketService, OnDestroy {
  // configuration object WebSocketSubject
  private config: WebSocketSubjectConfig<IWsMessage<any>>;

  private webSocketSub: SubscriptionLike;
  private statusSub: SubscriptionLike;

  // Observable for reconnection by interval
  private reconnection$: Observable<number>;
  private websocket$: WebSocketSubject<IWsMessage<any>>;

  // tells when reconnect and connect comes
  private connection$: Observer<boolean>;

  // secondary Observable for work with subscriptions
  private wsMessages$: Subject<IWsMessage<any>>;

  // pause between reconnect tries in ms
  private reconnectInterval: number;

  // number of reconnect tries
  private reconnectAttempts: number;

  // sync helper for connection status
  private isConnected: boolean;

  // connection status
  public status: Observable<boolean>;

  constructor(
    @Inject(config) private wsConfig: WebSocketConfig
  ) {
    this.wsMessages$ = new Subject<IWsMessage<any>>();

    this.reconnectInterval = wsConfig.reconnectInterval || 5000; // pause between connections
    this.reconnectAttempts = wsConfig.reconnectAttempts || 10; // number of connection attempts

    this.config = {
      url: wsConfig.url,
      closeObserver: {
        next: (event: CloseEvent) => {
          this.websocket$ = null;
          this.connection$.next(false);
        }
      },
      openObserver: {
        next: (event: Event) => {
          console.log('WebSocket connected!');
          this.connection$.next(true);
        }
      }
    };

    // connection status
    this.status = new Observable<boolean>((observer) => {
      this.connection$ = observer;
    }).pipe(share(), distinctUntilChanged());

    // run reconnect when there is no connection
    this.statusSub = this.status
      .subscribe((isConnected) => {
        this.isConnected = isConnected;

        if (!this.reconnection$ && typeof (isConnected) === 'boolean' && !isConnected) {
          this.reconnect();
        }
      });

    // telling that smth went wrong
    this.webSocketSub = this.wsMessages$.subscribe(
      null, (error: ErrorEvent) => console.error('WebSocket error!', error)
    );

    // connecting
    this.connect();
  }

  /*
   * connect to WebSocket
   * */
  private connect(): void {
    this.websocket$ = new WebSocketSubject(this.config); // creating

    // if there is a message, send them farther,
    // if not, wait
    // reconnect, if got an error
    this.websocket$.subscribe(
      (message) => this.wsMessages$.next(message),
      (error: Event) => {
        if (!this.websocket$) {
          // run reconnect if errors
          this.reconnect();
        }
      }
    );
  }

  private reconnect(): void {
    // Creating interval with value of reconnectInterval
    this.reconnection$ = interval(this.reconnectInterval)
      .pipe(takeWhile((v, index) => index < this.reconnectAttempts && !this.websocket$));

    this.reconnection$.subscribe(
      () => this.connect(),
      null,
      () => {
        // Subject complete if reconnect attempts ending
        this.reconnection$ = null;

        if (!this.websocket$) {
          this.wsMessages$.complete();
          this.connection$.complete();
        }
      }
    );
  }

  /*
    * on message event
     */
  public on<T>(event: string): Observable<T> {
    if (event) {
      return this.wsMessages$.pipe(
        filter((message: IWsMessage<T>) => message.event === event),
        map((message: IWsMessage<T>) => message.data)
      );
    }
  }

  public send(event: string, data: any = {}): void {
    if (event && this.isConnected) {
      // any because at that end expected string
      this.websocket$.next(<any>JSON.stringify({event, data}));
    } else {
      console.error('WebSocket send error!');
    }
  }

  ngOnDestroy() {
    this.webSocketSub.unsubscribe();
    this.statusSub.unsubscribe();
  }


}
