import {Injectable} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() {
  }

  compareConversationsByTheLastMessage(conv1: Conversation, conv2: Conversation): number {
    if (!conv1.theLastMessage && !conv2.theLastMessage) {
      return 0;
    } else if (!conv1.theLastMessage) {
      return -1;
    } else if (!conv2.theLastMessage) {
      return 1;
    } else {
      this.compareMessagesByDate(conv1.theLastMessage, conv2.theLastMessage);
    }
  }

  compareMessagesByDate(msg1: Message, msg2: Message): number {
    if (msg1.date.constructor.name === 'String') {
      msg1.date = new Date(msg1.date);
    }
    if (msg2.date.constructor.name === 'String') {
      msg2.date = new Date(msg2.date);
    }
    return msg1.date.getTime() - msg2.date.getTime();
  }
}
