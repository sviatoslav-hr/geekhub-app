import {Component, ElementRef, OnInit} from '@angular/core';
import {Conversation} from '../models/conversation';
import {Message} from '../models/message';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {User} from '../models/user';
import {OutgoingMessage} from '../models/outgoing-message';
import {UserService} from '../services/user.service';
import {ChatService} from '../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  loggedUser = new User();
  unreadMessages = new Map<number, Message[]>();
  private pendingMessages: Message[] = [];
  msgEnabled = false;
  isMsgWindowMaximized = true;
  selectedConversation: Conversation;
  receiver: User;
  conversations: Conversation[];
  messages: Message[];
  privateMsg: OutgoingMessage;


  constructor(
    private messageService: WsMessageService,
    private tokenService: TokenStorageService,
    private chatService: ChatService,
    private userService: UserService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit() {
    if (this.tokenService.getToken()) {
      this.getConversations();
      this.loggedUser.username = this.tokenService.getUsername();
      this.msgEnabled = this.tokenService.areConversationsEnabled();
      if (this.msgEnabled) {
        this.getUnreadMessagesAndSubscribeForUpdates();
      }
    } else {
      console.error('Please Log in to start messaging!');
    }
  }

  // fixme: change unreadMessages number due to ws
  openConversation(conversation: Conversation) {
    if (!this.selectedConversation || this.selectedConversation.id !== conversation.id) {
      this.selectedConversation = conversation;
      this.setNewPrivateMessage(conversation);
      this.receiver = conversation.users[0].username !== this.loggedUser.username ?
        conversation.users[0] : conversation.users[1];

      this.messageService.getMessagesForConversation(conversation.id).subscribe((messages) => {
        document.getElementById('private-msg-input').focus();

        this.messages = messages.reverse();

        this.subscribeForNewMessages(conversation);

        if (this.unreadMessages.get(conversation.id) && this.unreadMessages.get(conversation.id).length > 0) {
          this.messageService.saveMessagesAsRead(this.selectedConversation.id, this.loggedUser.username);
        }
        // if (this.unreadMessages.get(this.selectedConversation.id)) {
        //   this.unreadMessages.get(this.selectedConversation.id).forEach(newMessage => this.messages.unshift(newMessage));
        // }
        this.unreadMessages.set(this.selectedConversation.id, []);

        this.messageService.subscribeForReadMessagesUpdates(conversation.id, (readMessages: Message[]) => {
          console.log('%cUpdating read messages', 'color:blue');
          console.log(readMessages);
          // console.log(this.unreadMessages.get(conversation.id));
          // console.log(this.messages.filter(value => value.constructor.name === 'OutgoingMessage'));
          // console.log(this.messages.filter(value => value.constructor.name !== 'OutgoingMessage'));
          readMessages.forEach(message => {
            const findIndex = this.messages.findIndex(value => value.id === message.id ||
              value.parentMessageId === message.parentMessageId);
            if (findIndex >= 0) {
              console.log('%creplacing...', 'color:blue');
              // console.log(message);
              // console.log(this.messages[findIndex]);
              this.messages[findIndex] = message;
            } else {
              console.log('%cnot found...', 'color:red');
              console.log(message);
              console.log(this.messages);
            }
            // if there is element in map with ID conversation.id, remove message from array by filter
            // otherwise create empty array
            this.unreadMessages.set(conversation.id,
              this.unreadMessages.get(conversation.id) ?
                this.unreadMessages.get(conversation.id).filter(value => value.id !== message.id) :
                null
            );
          });
        });
      });
    }
  }

  private getConversations() {
    this.messageService.getConversations(this.tokenService.getUsername()).subscribe((conversations) => {
      this.conversations = conversations;

      this.messageService.subscribeForConversationsUpdates(this.loggedUser.username, (conversation: Conversation) => {
        const foundIndex = this.conversations.findIndex(value => value.id === conversation.id);

        // foundIndex = -1 if upcoming conversation is new and was not found in array
        if (foundIndex >= 0) {
          this.conversations[foundIndex] = conversation;
          this.conversations = this.conversations
            .sort((a, b) => this.chatService.compareConversationsByTheLastMessage(a, b));
        } else {
          this.conversations.unshift(conversation);
        }

        if (!this.selectedConversation || conversation.id !== this.selectedConversation.id) {
          this.unreadMessages.get(conversation.id) ?
            this.unreadMessages.get(conversation.id).unshift(conversation.theLastMessage) :
            this.unreadMessages.set(conversation.id, [conversation.theLastMessage]);
        }
      });
    });
  }

  private clearConversations() {
    this.conversations = null;
    this.messageService.conversationsDisconnect();
    if (!this.isMsgWindowMaximized) {
      this.messageService.messagesDisconnect();
    }
  }

  switchMsgWindow() {
    document.getElementById('chat-outer-container').removeAttribute('style');
    this.isMsgWindowMaximized = !this.isMsgWindowMaximized;
  }

  enableOrDisableConversations() {
    this.msgEnabled = !this.msgEnabled;
    this.tokenService.setConversationsEnabled(this.msgEnabled);

    if (this.msgEnabled) {
      this.getConversations();
      this.getUnreadMessagesAndSubscribeForUpdates();
    } else {
      if (this.isMsgWindowMaximized) {
        this.messages = null;
        this.selectedConversation = null;
      }
      this.conversations = null;
      this.clearConversations();
    }
  }

  getHeightByTop(element): number {
    return window.innerHeight - (element.offsetTop ? element.offsetTop : this.elementRef.nativeElement.offsetTop);
  }

  closeConversation() {
    this.selectedConversation = null;
    this.messages = null;
    this.messageService.messagesDisconnect();
  }

  private sendPrivateMsg(input) {
    if (this.messages) {
      this.privateMsg.parentMessageId = this.messages[0].id;
    }
    this.privateMsg.date = new Date();
    if (this.privateMsg.content && this.privateMsg.content.length > 0) {
      if (this.privateMsg.content.trim() === '') {
        this.privateMsg.content = '';
        return;
      } else if (this.messages[0].constructor.name !== 'OutgoingMessage') {
        this.messageService.sendPrivateMsg(this.privateMsg);
      } else {
        this.pendingMessages.push(this.privateMsg);
      }
      this.messages.unshift(this.privateMsg);
    }
    input.value = '';

    const elementById = document.getElementById('msg-container');
    elementById.scrollTo(0, elementById.scrollHeight);

    this.setNewPrivateMessage(this.selectedConversation);
  }

  private setNewPrivateMessage(conversation: Conversation) {
    this.privateMsg = new OutgoingMessage();
    this.privateMsg.conversationId = conversation.id;
    this.privateMsg.recipientUsername = conversation.users[0].username === this.loggedUser.username ?
      conversation.users[1].username : conversation.users[0].username;
    this.privateMsg.senderUsername = conversation.users[0].username === this.loggedUser.username ?
      conversation.users[0].username : conversation.users[1].username;
  }

  // when message comes from server, callback works
  private subscribeForNewMessages(conversation: Conversation) {
    // console.log('%cinside subscribing for new message', 'color: blue; font-size: 20px;');
    // fixme: websocket subscribes from anonymous window to current
    this.messageService.subscribeForNewMessages(conversation.id, (newMessage: Message) => {
      if (!newMessage) {
        console.log('%cError: Incoming new message is null', 'color: red; font-size: 16px');
      }
      // check for message duplication
      if (this.messages[0].id !== newMessage.id) {
        const unreadMessages = this.unreadMessages.get(conversation.id);
        // check for new message duplication
        if (unreadMessages && unreadMessages.length > 0 && unreadMessages[0].id === newMessage.id) {
          console.log('%cError: trying to add already added new message.', 'color: red; font-size: 16px;');
          return;
        }
        // if message was sent by loggedUser, replace temporary message
        if (newMessage.sender.username === this.loggedUser.username) {
          // find index of pending message to replace
          const oldMessageIndex = this.messages.findIndex(message => {
            if (!message.parentMessageId && message.constructor.name !== 'OutgoingMessage') {
              return false;
            }
            return (message.constructor.name === 'OutgoingMessage'
              && message.parentMessageId === newMessage.parentMessageId) || (message.id && message.id === newMessage.id);
          });
          if (oldMessageIndex < 0) {
            console.log('less than 0');
          } else if (!this.messages[oldMessageIndex].id || this.messages[oldMessageIndex].id !== newMessage.id) {
            this.messages[oldMessageIndex] = newMessage;
          }
          // if there if another pending messages
          if (this.pendingMessages.length > 0) {
            const firstPendingMsg = this.pendingMessages.shift();
            console.log('%cSending next pending message', 'color: blue; font-size: 16px;');
            console.log(newMessage);
            console.log(firstPendingMsg);
            firstPendingMsg.parentMessageId = newMessage.id;
            this.messageService.sendPrivateMsg(firstPendingMsg);
          }

        } else {
          const elementById = document.getElementById('msg-container');
          // if messages was scrolled to bottom
          // fixme: replace '30' with height of the last msg block
          if (elementById.scrollHeight - elementById.scrollTop < elementById.offsetHeight + 30) {
            setTimeout(() => this.messageService.saveMessagesAsRead(this.selectedConversation.id, this.loggedUser.username), 100);
            this.messages.unshift(newMessage);
          } else {
            this.unreadMessages.get(conversation.id) ?
              this.unreadMessages.get(conversation.id).unshift(newMessage) :
              this.unreadMessages.set(conversation.id, [newMessage]);
          }
        }
        this.privateMsg.parentMessageId = newMessage.id;
      } else {
        console.log('%cError: trying to add already added message.', 'color: red; font-size: 16px;');
      }
    });
  }

  checkIfNewMessage() {
    const newMessagesBlock = document.getElementById('new-messages-block');
    const msgContainer = document.getElementById('msg-container');
    // if was scrolled to block of new messages
    if (msgContainer.scrollHeight - msgContainer.scrollTop < msgContainer.offsetHeight + newMessagesBlock.offsetHeight) {
      this.messageService.saveMessagesAsRead(this.selectedConversation.id, this.loggedUser.username);
      this.unreadMessages.get(this.selectedConversation.id).forEach(newMessage => this.messages.unshift(newMessage));
      this.unreadMessages.set(this.selectedConversation.id, []);
    } else {
      // console.log('%cmessage is not in view', 'color: red; font-size: 16px;');
    }
  }

  getUnreadMessagesAndSubscribeForUpdates() {
    // group unread messages by conversationId
    this.userService.getUnreadMessages(this.loggedUser.username)
      .subscribe(messages => messages.forEach(message => {
        if (this.unreadMessages.get(message.conversationId)) {
          if (this.unreadMessages.get(message.conversationId).findIndex(value => value.id === message.id) < 0) {
            this.unreadMessages.get(message.conversationId).unshift(message);
          }
        } else {
          this.unreadMessages.set(message.conversationId, []);
          this.unreadMessages.get(message.conversationId).unshift(message);
        }
      }));
  }

  // todo: remake get conversations & get messages as http request, not ws
  getNumberOfUnreadMessages(conversation: Conversation): number {
    return this.unreadMessages.get(conversation.id) ? this.unreadMessages.get(conversation.id).length : -1;
  }

  doStuff() {
    window.location.href = 'https://www.youtube.com/watch?v=3-CVWM0B9B4';
  }
}
