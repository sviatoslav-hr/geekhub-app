import {Message} from './message';

export class IncomingMessage extends Message {
  constructor(
    public isRead?: boolean
  ) {
    super();
  }
}

