import {Injectable} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from './auth/token-storage.service';
import {OutgoingMessage} from '../models/outgoing-message';
import {ChatComponent} from '../chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private wsMessageService: WsMessageService,
    private storageService: TokenStorageService
  ) {
  }

  public static compareConversationsByTheLastMessage(conv1: Conversation, conv2: Conversation): number {
    if (!conv1.theLastMessage && !conv2.theLastMessage) {
      return 0;
    } else if (!conv1.theLastMessage) {
      return -1;
    } else if (!conv2.theLastMessage) {
      return 1;
    } else {
      ChatService.compareMessagesByDate(conv1.theLastMessage, conv2.theLastMessage);
    }
  }

  public static compareMessagesByDate(msg1: Message, msg2: Message): number {
    if (msg1.date.constructor.name === 'String') {
      msg1.date = new Date(msg1.date);
    }
    if (msg2.date.constructor.name === 'String') {
      msg2.date = new Date(msg2.date);
    }
    return msg1.date.getTime() - msg2.date.getTime();
  }

  subscribeForNewMessages(chatComponent: ChatComponent) {
    // console.log('%cinside subscribing for new message', 'color: blue; font-size: 20px;');
    // fixme: websocket subscribes from anonymous window to current
    this.wsMessageService.subscribeForNewMessages(chatComponent.selectedConversation.id, (newMessage: Message) => {
      if (!newMessage) {
        console.log('%cError: Incoming new message is null', 'color: red; font-size: 16px');
      }
      console.log(newMessage);
      const loggedUsername = this.storageService.getUsername();
      // check for message duplication
      if (chatComponent.messages[0].id !== newMessage.id) {
        // check for new message duplication
        if (chatComponent.unreadMessages && chatComponent.unreadMessages.length > 0 &&
          chatComponent.unreadMessages[0].id === newMessage.id) {
          console.log('%cError: trying to add already added new message.', 'color: red; font-size: 16px;');
          return;
        }
        // if message was sent by loggedUser, replace temporary message
        if (newMessage.sender.username === loggedUsername) {
          // find index of pending message to replace
          const oldMessageIndex = chatComponent.messages.findIndex(message => {
            if (!message.parentMessageId && message.constructor.name !== 'OutgoingMessage') {
              return false;
            }
            return (message.constructor.name === 'OutgoingMessage'
              && message.parentMessageId === newMessage.parentMessageId) || (message.id && message.id === newMessage.id);
          });
          if (oldMessageIndex < 0) {
            console.log('Found index less than 0 - message not found');
          } else if (!chatComponent.messages[oldMessageIndex].id || chatComponent.messages[oldMessageIndex].id !== newMessage.id) {
            chatComponent.messages[oldMessageIndex] = newMessage;
          }
          // if there if another pending messages
          if (chatComponent.pendingMessages.length > 0) {
            const firstPendingMsg = chatComponent.pendingMessages.shift();
            console.log('%cSending next pending message', 'color: blue; font-size: 16px;');
            console.log(newMessage);
            console.log(firstPendingMsg);
            firstPendingMsg.parentMessageId = newMessage.id;
            this.wsMessageService.sendPrivateMsg(firstPendingMsg);
          }

        } else {
          const elementById = document.getElementById('msg-container');
          // if messages was scrolled to bottom
          // fixme: replace '30' with height of the last msg block
          if (elementById.scrollHeight - elementById.scrollTop < elementById.offsetHeight + 30) {
            setTimeout(() => this.wsMessageService.saveMessagesAsRead(chatComponent.selectedConversation.id, loggedUsername), 100);
            chatComponent.messages.unshift(newMessage);
          } else {
            chatComponent.unreadMessages ?
              chatComponent.unreadMessages.unshift(newMessage) :
              chatComponent.unreadMessagesEmitter.emit([newMessage]);
          }
        }
        chatComponent.draftMessage.parentMessageId = newMessage.id;
      } else {
        console.log('%cError: trying to add already added message:', 'color: red; font-size: 16px;');
        console.log(newMessage);
      }
    });
  }

  getMessages(chatComponent: ChatComponent, conversationId: number) {
    this.wsMessageService.getMessagesForConversation(conversationId).subscribe((messages) => {
      this.subscribeForNewMessages(chatComponent);

      document.getElementById('chat-input').focus();

      chatComponent.messages = messages.reverse();

      if (chatComponent.unreadMessages && chatComponent.unreadMessages.length > 0) {
        this.wsMessageService.saveMessagesAsRead(chatComponent.selectedConversation.id, chatComponent.loggedUsername);
      }
      // if (this.unreadMessages.get(this.selectedConversation.id)) {
      //   this.unreadMessages.get(this.selectedConversation.id).forEach(newMessage => this.messages.unshift(newMessage));
      // }
      chatComponent.unreadMessagesEmitter.emit([]);

      this.subscribeForReadMessagesUpdates(chatComponent, conversationId);
    });
  }

  subscribeForReadMessagesUpdates(chatComponent: ChatComponent, conversationId: number) {
    this.wsMessageService.subscribeForReadMessagesUpdates(conversationId, (readMessages: Message[]) => {
      console.log('%cUpdating read messages', 'color:blue');
      console.log(readMessages);
      // console.log(this.unreadMessages.get(conversation.id));
      // console.log(this.messages.filter(value => value.constructor.name === 'OutgoingMessage'));
      // console.log(this.messages.filter(value => value.constructor.name !== 'OutgoingMessage'));
      readMessages.forEach(message => {
        const findIndex = chatComponent.messages.findIndex(value => value.id === message.id ||
          value.parentMessageId === message.parentMessageId);
        if (findIndex >= 0) {
          console.log('%creplacing...', 'color:blue');
          // console.log(message);
          // console.log(this.messages[findIndex]);
          chatComponent.messages[findIndex] = message;
        } else {
          console.log('%cnot found...', 'color:red');
          console.log(message);
          console.log(chatComponent.messages);
        }
        // if there is element in map with ID conversation.id, remove message from array by filter
        // otherwise create empty array
        chatComponent.unreadMessagesEmitter.emit(
          chatComponent.unreadMessages ?
            chatComponent.unreadMessages
              .filter(value => value.id !== message.id) : null);
      });
    });

  }

  setReceiver(chatComponent: ChatComponent, conversation: Conversation) {
    chatComponent.receiver = conversation.users[0].username !== this.storageService.getUsername() ?
      conversation.users[0] : conversation.users[1];
  }
}
