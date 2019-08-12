import {Component, OnDestroy, OnInit} from '@angular/core';
import {Conversation} from '../../../models/conversation';
import {LocalStorageService} from '../../../services/local-storage.service';
import {ChatService} from '../../../services/chat.service';
import {UserService} from '../../../services/user.service';
import {AuthService} from '../../../services/auth/auth.service';
import {ConversationsService} from '../../../services/conversations.service';
import {Message} from '../../../models/message';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {
  isEnabled = false;

  constructor(
    private storageService: LocalStorageService,
    private chatService: ChatService,
    private userService: UserService,
    private authService: AuthService,
    private conversationsService: ConversationsService
  ) {
  }

  ngOnInit() {
    if (LocalStorageService.token) {
      if (LocalStorageService.areConversationsEnabled) {
        this.isEnabled = true;
        this.conversationsService.loadConversations();
      }
    } else {
      console.error('Please Log in to start messaging!');
    }
  }

  ngOnDestroy(): void {
    this.conversationsService.selectedConversation = null;
  }

  get conversations(): Conversation[] {
    return this.conversationsService.conversations;
  }

  get draftMessages(): Map<number, Message> {
    return this.conversationsService.draftMessages;
  }

  get selectedConversation(): Conversation {
    return this.conversationsService.selectedConversation;
  }

  enableConversations() {
    this.isEnabled = true;
    LocalStorageService.areConversationsEnabled = this.isEnabled;
    this.conversationsService.loadConversations();
  }

  disableConversations() {
    this.isEnabled = false;
    LocalStorageService.areConversationsEnabled = this.isEnabled;
    this.conversationsService.clearConversations();
  }

  getNumberOfUnreadMessages(conversation: Conversation): number {
    return this.conversationsService.unreadMessages.get(conversation.id) ?
      this.conversationsService.unreadMessages.get(conversation.id).length : -1;
  }


  openConversation(conversation: Conversation) {
    this.conversationsService.openConversation(conversation);
  }
}
