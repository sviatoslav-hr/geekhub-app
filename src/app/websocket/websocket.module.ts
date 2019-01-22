import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { config } from './websocket.config';
import {WebSocketConfig} from './websocket.interfaces';
import {WebsocketService} from './websocket.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ], providers: [
    WebsocketService
  ]
})
export class WebsocketModule {
  public static config(wsConfig: WebSocketConfig): ModuleWithProviders {
    return {
      ngModule: WebsocketModule,
      providers: [{ provide: config, useValue: wsConfig }]
    };
  }
}
