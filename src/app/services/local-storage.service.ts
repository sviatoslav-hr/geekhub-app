import {Injectable} from '@angular/core';
import {User} from '../models/user';

const TOKEN_KEY = 'AuthToken';
const USERNAME_KEY = 'AuthUsername';
const AUTHORITIES_KEY = 'AuthAuthorities';
const PASSWORD_KEY = 'AuthPassword';
const ARE_CONVERSATIONS_ENABLED_KEY = 'AreConversationEnabled';
const SELECTED_CONVERSATION_KEY = 'SelectedConversationId';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private roles: Array<string> = [];

  constructor() {
  }

  clear() {
    window.localStorage.clear();
  }

  public set token(token: string) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public get token(): string {
    return localStorage.getItem(TOKEN_KEY);
  }

  public set username(username: string) {
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.setItem(USERNAME_KEY, username);
  }

  public get username(): string {
    return localStorage.getItem(USERNAME_KEY);
  }

  public set authorities(authorities: string[]) {
    window.localStorage.removeItem(AUTHORITIES_KEY);
    window.localStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
  }

  public get authorities(): string[] {
    this.roles = [];

    if (localStorage.getItem(TOKEN_KEY)) {
      JSON.parse(localStorage.getItem(AUTHORITIES_KEY)).forEach(authority => {
        this.roles.push(authority.authority);
      });
    }

    return this.roles;
  }

  public get areConversationsEnabled(): boolean {
    return (localStorage.getItem(ARE_CONVERSATIONS_ENABLED_KEY) === 'true');
  }

  public set areConversationsEnabled(value: boolean) {
    window.localStorage.removeItem(ARE_CONVERSATIONS_ENABLED_KEY);
    window.localStorage.setItem(ARE_CONVERSATIONS_ENABLED_KEY, value + '');
  }

  public get selectedConversationId(): number {
    return +(localStorage.getItem(SELECTED_CONVERSATION_KEY));
  }

  public set selectedConversationId(value: number) {
    window.localStorage.removeItem(SELECTED_CONVERSATION_KEY);
    window.localStorage.setItem(SELECTED_CONVERSATION_KEY, value + '');
  }

  public removeSelectedConversationId() {
    window.localStorage.removeItem(SELECTED_CONVERSATION_KEY);
  }


}
