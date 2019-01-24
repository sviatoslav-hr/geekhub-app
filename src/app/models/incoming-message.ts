export class IncomingMessage {
  constructor(
    public content?: string,
    public conversationId?: number,
    public recipientId?: number,
    public senderId?: number
  ) {
  }
}

