import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) {
  }

  getAllUsers(): Observable<User[]> {
    console.log('inside getAllUsers');
    return this.http.get<User[]>('http://localhost:8080/api/users');
  }
}
