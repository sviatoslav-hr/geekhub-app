import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user';
import {UserSearchModel} from '../components/user-search/UserSearchModel';
import {Message} from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userUrl = 'http://localhost:8080/api/test/user';
  private pmUrl = 'http://localhost:8080/api/test/pm';
  private adminUrl = 'http://localhost:8080/api/test/admin';

  private getLoggedUserUrl = 'http://localhost:8080/api/auth-user/';
  private getUserByIdUrl = 'http://localhost:8080/api/user/';
  private getUserByUsernameUrl = 'http://localhost:8080/api/get-user-by-username';
  private getAllUsersUrl = 'http://localhost:8080/api/users';
  private findUserUrl = 'http://localhost:8080/api/find-user';
  private getUnreadMessagesUrl = 'http://localhost:8080/api/unread-messages';

  constructor(
    private http: HttpClient
  ) {
  }

  getUserByUsername(username: string): Observable<User> {
    const params = new HttpParams().set('username', username);
    return this.http.get<User>(this.getUserByUsernameUrl, {params: params});
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.getUserByIdUrl + id);
  }

  getLoggedUser(): Observable<User> {
    return this.http.get<User>(this.getLoggedUserUrl);
  }

  getUserBoard(): Observable<string> {
    return this.http.get(this.userUrl, {responseType: 'text'});
  }

  getPMBoard(): Observable<string> {
    return this.http.get(this.pmUrl, {responseType: 'text'});
  }

  getAdminBoard(): Observable<string> {
    return this.http.get(this.adminUrl, {responseType: 'text'});
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.getAllUsersUrl);
  }

  findUser(fullName: string): Observable<UserSearchModel[]> {
    const params = new HttpParams().set('fullName', fullName);
    return this.http.get<UserSearchModel[]>(this.findUserUrl, {params: params});
  }

  getUnreadMessages(username: string): Observable<Message[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<Message[]>(this.getUnreadMessagesUrl, {params: params});
  }

}
