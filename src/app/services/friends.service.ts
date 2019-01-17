import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {User} from '../models/user';
import {Observable} from 'rxjs';
import {FriendRequest} from '../models/friend-request';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private getUserFriendsListURL = 'http://localhost:8080/api/user-friends';
  private sendFriendRequestURL = 'http://localhost:8080/send-friend-request';
  private acceptFriendRequestURL = 'http://localhost:8080/accept-friend-request';
  private cancelFriendRequestURL = 'http://localhost:8080/cancel-friend-request';
  private deleteFriendURL = 'http://localhost:8080/delete-friend';
  private getIncomingFriendRequestsURL = 'http://localhost:8080/incoming-friend-requests';
  private getOutgoingFriendRequestsURL = 'http://localhost:8080/outgoing-friend-requests';
  private getFriendsListURL = 'http://localhost:8080/api/friends';

  constructor(
    private http: HttpClient
  ) {
  }

  public getFriendsList(): Observable<User[]> {
    return this.http.get<User[]>(this.getFriendsListURL);
  }

  public getFriendsListByUsername(username: string): Observable<User[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<User[]>(this.getUserFriendsListURL, {params: params});
  }

  public getIncomingFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(this.getIncomingFriendRequestsURL);
  }

  getOutgoingFriendRequests() {
    return this.http.get<FriendRequest[]>(this.getOutgoingFriendRequestsURL);
  }

  public sendFriendRequest(receiverId: number): Observable<boolean> {
    const params = new HttpParams().set('friendId', receiverId.toString());
    return this.http.post<boolean>(this.sendFriendRequestURL, params);
  }

  public acceptFriendRequest(senderId: number): Observable<boolean> {
    const body = new HttpParams().set('friendId', senderId.toString());
    return this.http.post<boolean>(this.acceptFriendRequestURL, body);
  }

  public cancelFriendRequest(senderId: number): Observable<boolean> {
    const body = new HttpParams().set('friendId', senderId.toString());
    return this.http.post<boolean>(this.cancelFriendRequestURL, body);
  }

  public deleteFriend(friendId: number): Observable<boolean> {
    const body = new HttpParams().set('friendId', friendId.toString());
    return this.http.post<boolean>(this.deleteFriendURL, body);
  }
}
