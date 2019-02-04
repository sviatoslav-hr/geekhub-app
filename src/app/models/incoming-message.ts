export class IncomingMessage {
  constructor(
    public content?: string,
    public conversationId?: number,
    public recipientUsername?: string,
    public senderUsername?: string
  ) {
  }
}

