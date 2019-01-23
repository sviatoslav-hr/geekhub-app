import {Conversation} from './conversation';
import {User} from './user';

export class Message {
  constructor(
    public id?: number,
    public conversation?: Conversation,
    public sender?: User,
    public content?: string,
    public date?: string,
    public parentMsg?: Message
  ) {}
}
