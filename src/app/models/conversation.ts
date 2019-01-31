import {User} from './user';
import {Message} from './message';

export class Conversation {
  constructor(
    public id?: number,
    public users?: User[],
    public messages?: Message[],
    public theLastMessage?: Message
  ) {
  }
}
