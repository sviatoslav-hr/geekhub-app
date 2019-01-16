import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {User} from '../models/user';
import {Observable} from 'rxjs';
import {FriendRequest} from '../models/friend-request';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private getFriendsListURL = 'http://localhost:8080/api/user-friends';
  private sendFriendRequestURL = 'http://localhost:8080/send-friend-request';
  private acceptFriendRequestURL = 'http://localhost:8080/accept-friend-request';
  private deleteFriendURL = 'http://localhost:8080/delete-friend';
  private getIncomingFriendRequestsURL = 'http://localhost:8080/incoming-friend-requests';

  constructor(
    private http: HttpClient
  ) {
  }

  public getFriendsListByUsername(username: string): Observable<User[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<User[]>(this.getFriendsListURL, {params: params});
  }

  public getIncomingFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(this.getIncomingFriendRequestsURL);
  }

  public sendFriendRequest(receiverId: number): Observable<boolean> {
    const params = new HttpParams().set('friendId', receiverId.toString());
    return this.http.post<boolean>(this.sendFriendRequestURL, params);
  }

  public acceptFrientRequest(senderId: number): Observable<boolean> {
    const body = new HttpParams().set('friendId', senderId.toString());
    return this.http.post<boolean>(this.acceptFriendRequestURL, body);
  }

  public deleteFriend(friendId: number): Observable<boolean> {
    const body = new HttpParams().set('friendId', friendId.toString());
    return this.http.post<boolean>(this.acceptFriendRequestURL, body);
  }
}
