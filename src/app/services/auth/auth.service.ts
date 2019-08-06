import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthLoginInfo} from './login-info';
import {SignUpInfo} from './signup-info';
import {JwtResponse} from './jwt-response';
import {User} from '../../models/user';
import {LocalStorageService} from '../local-storage.service';
import {UserService} from '../user.service';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: User;
  private storedPassword: string;

  private loginUrl = 'http://localhost:8080/api/auth/signin';
  private signUpUrl = 'http://localhost:8080/api/auth/signup';
  private verificationCodeUrl = 'http://localhost:8080/api/auth/get-verification-code';
  private sendCodeToEmailUrl = 'http://localhost:8080/api/auth/send-code-to-email';
  private setNewPasswordUrl = 'http://localhost:8080/api/auth/set-new-password';

  constructor(
    private http: HttpClient,
    private storageService: LocalStorageService,
    private userService: UserService,
    private router: Router
  ) {
  }

  get currentUser(): User {
    return this.user;
  }

  public isLogged(): boolean {
    return !!this.user;
  }

  public storePassword(password: string) {
    console.log({password});
    this.storedPassword = password;
  }

  requestCurrentUser() {
    const username = this.storageService.username;
    if (username) {
      this.userService.getUserByUsername(username)
        .subscribe(user => {
            this.user = user;
            console.log(user);
          },
          () => {
            setTimeout(() => this.requestCurrentUser(), 5000);
          });
    }
  }

  attemptAutoAuth(): Observable<JwtResponse> {
    if (this.storedPassword && this.storageService.username) {
      console.log('trying to auto auth with password: ' + this.storedPassword);
      const credentials = {username: this.storageService.username, password: this.storedPassword};
      return this.attemptAuth(credentials).pipe(map((data) => {
        this.storedPassword = null;
        return data;
      }));
    }
  }

  // Jwt response(accessToken, type, username, authorities)
  attemptAuth(credentials: AuthLoginInfo): Observable<JwtResponse | any> {
    return this.http.post<JwtResponse>(this.loginUrl, credentials, httpOptions)
      .pipe(map(response => {
        // login successful if there's a response token in the response
        console.log(response);
        if (response && response.accessToken) {
          // store user details and response token in local storage to keep user logged in between page refreshes
          this.storageService.token = response.accessToken;
          this.storageService.username = response.username;
          this.storageService.authorities = response.authorities;
          this.requestCurrentUser();
        }
        return response;
      }));
  }

  public logOut() {
    this.user = null;
    this.storageService.clear();
    this.router.navigate(['/']);
  }

  // SignUpInfo(name, username, email, role, password)
  signUp(info: SignUpInfo): Observable<any> {
    return this.http.post<any>(this.signUpUrl, info);
  }

  verifyEmail(username: string, code: number): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('code', '' + code);
    return this.http.post<any>(this.verificationCodeUrl, null, {params});
  }

  sendCodeToEmail(username: string): Observable<any> {
    return this.http.post<any>(this.sendCodeToEmailUrl, username);
  }

  sendNewPassword(code: number, newPassword: string, username: string): Observable<any> {
    return this.http.post<string>(this.setNewPasswordUrl, {code, newPassword, username});
  }
}
