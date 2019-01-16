import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userUrl = 'http://localhost:8080/api/test/user';
  private pmUrl = 'http://localhost:8080/api/test/pm';
  private adminUrl = 'http://localhost:8080/api/test/admin';

  private getUserByIdUrl = 'http://localhost:8080/api/user/';
  private getUserByUsernameUrl = 'http://localhost:8080/api/get-user-by-username';
  private getAllUsersUrl = 'http://localhost:8080/api/users';

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

}
