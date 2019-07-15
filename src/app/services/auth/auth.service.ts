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
  private verifyCodeUrl = 'http://localhost:8080/api/auth/send-verification-code';
  private getVerificationCodeUrl = 'http://localhost:8080/api/auth/get-verification-code';
  private getPasswordResetCodeUrl = 'http://localhost:8080/api/auth/get-password-reset-code';
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
          errorResponse => {
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
  attemptAuth(credentials: AuthLoginInfo): Observable<JwtResponse> {
    console.log(JSON.stringify(credentials));
    return this.http.post<JwtResponse>(this.loginUrl, credentials, httpOptions)
      .pipe(map(jwt => {
        // login successful if there's a jwt token in the response
        if (jwt && jwt.accessToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.storageService.token = jwt.accessToken;
          this.storageService.username = jwt.username;
          this.storageService.authorities = jwt.authorities;
          this.requestCurrentUser();
          console.log(`%cSuccess log in! ${jwt.username}`, 'color: green; font-size: 12px');
        } else if (jwt) {
          console.log('%cGot JwtResponse without token!', 'color: red; font-size: 12px');
          console.log(jwt);
        } else {
          console.log('%cGot empty JwtResponse!', 'color: red; font-size: 12px');
        }
        return jwt;
      }));
  }

  public logOut() {
    this.user = null;
    this.storageService.clear();
    this.router.navigate(['/']);
  }

  // SignUpInfo(name, username, email, role, password)
  signUp(info: SignUpInfo): Observable<any> {
    console.log(info);
    return this.http.post<any>(this.signUpUrl, info);
  }

  sendCode(username: string, code: number): Observable<any> {
    return this.http.post<any>(this.getVerificationCodeUrl, {username, code});
  }

  sendUsernameForPasswordReset(username: string): Observable<any> {
    return this.http.post<string>(this.getPasswordResetCodeUrl, {username});
  }

  sendNewPassword(code: number, newPassword: string, username: string): Observable<any> {
    return this.http.post<string>(this.setNewPasswordUrl, {code, newPassword, username});
  }
}
