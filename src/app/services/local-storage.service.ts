import {Injectable} from '@angular/core';

const TOKEN_KEY = 'AuthToken';
const USERNAME_KEY = 'AuthUsername';
const AUTHORITIES_KEY = 'AuthAuthorities';
const ARE_CONVERSATIONS_ENABLED_KEY = 'AreConversationEnabled';
const SELECTED_CONVERSATION_KEY = 'SelectedConversationId';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() {
  }

  static clear() {
    window.localStorage.clear();
  }

  public static set token(token: string) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public static get token(): string {
    return localStorage.getItem(TOKEN_KEY);
  }

  public static set username(username: string) {
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.setItem(USERNAME_KEY, username);
  }

  public static get username(): string {
    return localStorage.getItem(USERNAME_KEY);
  }

  public static set authorities(authorities: string[]) {
    window.localStorage.removeItem(AUTHORITIES_KEY);
    window.localStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
  }

  public static get areConversationsEnabled(): boolean {
    return (localStorage.getItem(ARE_CONVERSATIONS_ENABLED_KEY) === 'true');
  }

  public static set areConversationsEnabled(value: boolean) {
    window.localStorage.removeItem(ARE_CONVERSATIONS_ENABLED_KEY);
    window.localStorage.setItem(ARE_CONVERSATIONS_ENABLED_KEY, value + '');
  }

  public static get selectedConversationId(): number {
    return +(localStorage.getItem(SELECTED_CONVERSATION_KEY));
  }

  public static set selectedConversationId(value: number) {
    window.localStorage.removeItem(SELECTED_CONVERSATION_KEY);
    window.localStorage.setItem(SELECTED_CONVERSATION_KEY, value + '');
  }

  public static removeSelectedConversationId() {
    window.localStorage.removeItem(SELECTED_CONVERSATION_KEY);
  }


}
