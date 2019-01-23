import { TestBed } from '@angular/core/testing';

import { WsMessageService } from './ws-message.service';

describe('WsMessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WsMessageService = TestBed.get(WsMessageService);
    expect(service).toBeTruthy();
  });
});
