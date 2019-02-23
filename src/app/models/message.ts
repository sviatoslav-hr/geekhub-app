import {User} from './user';

export class Message {
  constructor(
    public id?: number,
    // public conversation?: Conversation,
    public conversationId?: number,
    public sender?: User,
    public content?: string,
    public date?: Date,
    public parentMessageId?: number,
    public notSeenByUsers?: User[],
  ) {}
}
