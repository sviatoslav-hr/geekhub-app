import {Message} from './message';

export class OutgoingMessage extends Message {
  constructor(
    public conversationId?: number,
    public recipientUsername?: string,
    public senderUsername?: string,
    public status?: OutgoingMessageStatus
  ) {
    super();
  }
}

enum OutgoingMessageStatus {
  SENT, PENDING, ERROR
}
