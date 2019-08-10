import {Component, OnInit} from '@angular/core';
import {WebSocketMessageService} from '../../../services/websocket/web-socket-message.service';
import {LocalStorageService} from '../../../services/local-storage.service';
import {ChatService} from '../../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  constructor(
    private messageService: WebSocketMessageService,
    private storageService: LocalStorageService,
    private chatService: ChatService
  ) {
  }

  ngOnInit() {
  }

  switchMsgWindow() {
    document.getElementById('chat-outer-container').removeAttribute('style');
    this.chatService.isMsgWindowMaximized = !this.chatService.isMsgWindowMaximized;
  }

  goToNewLine(tarea: HTMLTextAreaElement) {
    tarea.value += '\n';
  }

  scrollChatToBottom() {
    const elementById = document.getElementById('msg-container');
    elementById.scrollTo(0, elementById.scrollHeight);
  }

  closeConversation() {
    this.chatService.conversation = null;
    LocalStorageService.removeSelectedConversationId();
    this.messageService.disconnect();
    this.chatService.conversationClosed.emit(true);
  }

  checkIfNewMessage() {
    const newMessagesBlock = document.getElementById('new-messages-block');
    const msgContainer = document.getElementById('msg-container');
    // if was scrolled to block of new messages
    if (msgContainer.scrollHeight - msgContainer.scrollTop < msgContainer.offsetHeight + newMessagesBlock.offsetHeight) {
      this.messageService.saveMessagesAsRead(this.chatService.conversation.id, LocalStorageService.username);
      this.chatService.unreadMessages.forEach(newMessage => this.chatService.messages.unshift(newMessage));
      this.chatService.unreadMessagesEmitter.emit([]);
    } else {
      // console.log('%cmessage is not in view', 'color: red; font-size: 16px;');
    }
  }

  private sendPrivateMsg(textarea: HTMLTextAreaElement, $event: UIEvent) {
    if ($event.type === 'keydown' && !$event.defaultPrevented) {
      $event.preventDefault();
    }
    if (this.isDisabled()) {
      return;
    }
    if (textarea.value.trim() === '') {
      this.chatService.draftMessage.content = '';
      return;
    }
    this.chatService.sendMessage();

    const elementById = document.getElementById('msg-container');
    if (elementById) {
      elementById.scrollTo(0, elementById.scrollHeight);
    }
    const sendBtn = document.getElementById('send-msg-btn');
    if (sendBtn) {
      sendBtn.focus();
    }
    textarea.value = '';
    textarea.rows = 1;
    this.chatService.initDraftMessage();
  }

  getNumberOfUnreadMessages(): number {
    return this.chatService.unreadMessages ? this.chatService.unreadMessages.length : -1;
  }

  isDisabled(): boolean {
    return !this.chatService.draftMessage || this.chatService.pendingMessages.length > 7;
  }
}
