import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Conversation} from '../models/conversation';
import {User} from '../models/user';
import {WsMessageService} from '../websocket/ws-message.service';
import {TokenStorageService} from '../services/auth/token-storage.service';
import {Message} from '../models/message';
import {OutgoingMessage} from '../models/outgoing-message';
import {ChatService} from '../services/chat.service';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() isMsgWindowMaximized = true;
  @Input() selectedConversation: Conversation;
  @Output() selectedConversationClosed = new EventEmitter<[boolean, OutgoingMessage]>();
  receiver: User;
  @Input() unreadMessages: Message[];
  @Output() unreadMessagesEmitter = new EventEmitter<Message[]>();
  messages: Message[];
  @Input() draftMessage: OutgoingMessage;
  pendingMessages: Message[] = [];
  loggedUsername: string;

  constructor(
    private messageService: WsMessageService,
    private storageService: TokenStorageService,
    private chatService: ChatService
  ) {
  }

  ngOnInit() {
    console.log('%cngOnInit', 'color: green; font-size: 16px');
    this.loggedUsername = this.storageService.getUsername();
    if (!this.draftMessage) {
      // wait till selected conversation will be initialised
      this.setNewDraftMessage(this.selectedConversation);
    }
  }

  switchMsgWindow() {
    document.getElementById('chat-outer-container').removeAttribute('style');
    this.isMsgWindowMaximized = !this.isMsgWindowMaximized;
  }

  goToNewLine(tarea: HTMLTextAreaElement) {
    tarea.value += '\n';
  }

  scrollChatToBottom() {
    const elementById = document.getElementById('msg-container');
    elementById.scrollTo(0, elementById.scrollHeight);
  }

  closeConversation() {
    this.selectedConversation = null;
    this.storageService.removeSelectedConversationId();
    this.messageService.messagesDisconnect();
    this.selectedConversationClosed.emit([true, this.draftMessage]);
  }

  checkIfNewMessage() {
    const newMessagesBlock = document.getElementById('new-messages-block');
    const msgContainer = document.getElementById('msg-container');
    // if was scrolled to block of new messages
    if (msgContainer.scrollHeight - msgContainer.scrollTop < msgContainer.offsetHeight + newMessagesBlock.offsetHeight) {
      this.messageService.saveMessagesAsRead(this.selectedConversation.id, this.storageService.getUsername());
      this.unreadMessages.forEach(newMessage => this.messages.unshift(newMessage));
      this.unreadMessagesEmitter.emit([]);
    } else {
      // console.log('%cmessage is not in view', 'color: red; font-size: 16px;');
    }
  }

  private sendPrivateMsg(textarea: HTMLTextAreaElement, $event: UIEvent) {
    if ($event.type === 'keydown' && !$event.defaultPrevented) {
      $event.preventDefault();
    }
    if (textarea.value.trim() === '') {
      this.draftMessage.content = '';
      return;
    }
    if (this.messages && this.messages.length > 0) {
      this.draftMessage.parentMessageId = this.messages[0].id;
    }
    if (!this.messages) {
      this.messages = [];
    }
    if (this.draftMessage.recipientUsername !== this.receiver.username ||
      this.draftMessage.conversationId !== this.selectedConversation.id) {
      this.draftMessage.recipientUsername = this.receiver.username;
      this.draftMessage.conversationId = this.selectedConversation.id;
    }
    this.draftMessage.date = new Date();
    if (this.draftMessage.content && this.draftMessage.content.length > 0) {
      if (this.draftMessage.content.trim() === '') {
        this.draftMessage.content = '';
        return;
      } else if (this.messages.length > 0 && this.messages[0].constructor.name !== 'OutgoingMessage') {
        this.messageService.sendPrivateMsg(this.draftMessage);
      } else if (this.messages.length > 0) {
        this.pendingMessages.push(this.draftMessage);
      }
      this.messages.unshift(this.draftMessage);
    }

    const elementById = document.getElementById('msg-container');
    elementById.scrollTo(0, elementById.scrollHeight);

    const sendBtn = document.getElementById('send-msg-btn');
    sendBtn.focus();

    textarea.value = '';
    textarea.rows = 1;

    this.setNewDraftMessage(this.selectedConversation);
  }


  private setNewDraftMessage(conversation: Conversation) {
    this.draftMessage = new OutgoingMessage();
    this.draftMessage.conversationId = conversation.id;
    this.draftMessage.recipientUsername = conversation.users[0].username === this.loggedUsername ?
      conversation.users[1].username : conversation.users[0].username;
    this.draftMessage.senderUsername = conversation.users[0].username === this.loggedUsername ?
      conversation.users[0].username : conversation.users[1].username;
  }

  getNumberOfUnreadMessages(conversation: Conversation): number {
    return this.unreadMessages ? this.unreadMessages.length : -1;
  }

  // when message comes from server, callback works
  showThis() {
    console.log(this);
  }
}
