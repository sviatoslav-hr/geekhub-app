import {Injectable} from '@angular/core';
import {User} from '../../models/user';

const TOKEN_KEY = 'AuthToken';
const USERNAME_KEY = 'AuthUsername';
const AUTHORITIES_KEY = 'AuthAuthorities';
const USER_KEY = 'AuthUser';
const ARE_CONVERSATIONS_ENABLED_KEY = 'AreConversationEnabled';
const SELECTED_CONVERSATION_KEY = 'SelectedConversationId';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private roles: Array<string> = [];

  constructor() {
  }

  signOut() {
    window.localStorage.clear();
  }

  public saveToken(token: string) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string {
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveUsername(username: string) {
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.setItem(USERNAME_KEY, username);
  }

  public getUsername(): string {
    return localStorage.getItem(USERNAME_KEY);
  }

  public saveAuthorities(authorities: string[]) {
    window.localStorage.removeItem(AUTHORITIES_KEY);
    window.localStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
  }

  public getAuthorities(): string[] {
    this.roles = [];

    if (localStorage.getItem(TOKEN_KEY)) {
      JSON.parse(localStorage.getItem(AUTHORITIES_KEY)).forEach(authority => {
        this.roles.push(authority.authority);
      });
    }

    return this.roles;
  }

  public saveUser(user: User) {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): User {
    return JSON.parse(window.localStorage.getItem(USER_KEY));
  }

  public areConversationsEnabled(): boolean {
    return (localStorage.getItem(ARE_CONVERSATIONS_ENABLED_KEY) === 'true');
  }

  public setConversationsEnabled(value: boolean) {
    window.localStorage.removeItem(ARE_CONVERSATIONS_ENABLED_KEY);
    window.localStorage.setItem(ARE_CONVERSATIONS_ENABLED_KEY, value + '');
  }

  public getSelectedConversationId(): number {
    return +(localStorage.getItem(SELECTED_CONVERSATION_KEY));
  }

  public setSelectedConversationId(value: number) {
    window.localStorage.removeItem(SELECTED_CONVERSATION_KEY);
    window.localStorage.setItem(SELECTED_CONVERSATION_KEY, value + '');
  }

  public removeSelectedConversationId() {
    window.localStorage.removeItem(SELECTED_CONVERSATION_KEY);
  }


}
