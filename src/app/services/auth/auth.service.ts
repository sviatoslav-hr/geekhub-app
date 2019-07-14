import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthLoginInfo} from './login-info';
import {SignUpInfo} from './signup-info';
import {JwtResponse} from './jwt-response';
import {CodeResponse} from './code-response';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = 'http://localhost:8080/api/auth/signin';
  private signUpUrl = 'http://localhost:8080/api/auth/signup';
  private verifyCodeUrl = 'http://localhost:8080/api/auth/send-verification-code';
  private getVerificationCodeUrl = 'http://localhost:8080/api/auth/get-verification-code';
  private getPasswordResetCodeUrl = 'http://localhost:8080/api/auth/get-password-reset-code';
  private setNewPasswordUrl = 'http://localhost:8080/api/auth/set-new-password';

  constructor(
    private http: HttpClient
  ) {
  }

  // Jwt response(accessToken, type, username, authorities)
  attemptAuth(credentials: AuthLoginInfo): Observable<JwtResponse> {
    console.log(JSON.stringify(credentials));
    return this.http.post<JwtResponse>(this.loginUrl, credentials, httpOptions);
  }

  // SignUpInfo(name, username, email, role, password)
  signUp(info: SignUpInfo): Observable<any> {
    console.log(info);
    return this.http.post<any>(this.signUpUrl, info);
  }

    sendCode(username: string, code: number): Observable<any> {
    console.log(code);
    return this.http.post<any>(this.getVerificationCodeUrl, {username, code}, {observe: 'response'});
  }

  sendUsernameForPasswordReset(username: string): Observable<any> {
    // console.log(code);
    // const params = new HttpParams().set('username', username).set('code', code.toString());
    // console.log(params);
    return this.http.post<string>(this.getPasswordResetCodeUrl, {username}, {observe: 'response'});
  }

  sendNewPassword(code: number, newPassword: string, username: string): Observable<any> {
    return this.http.post<string>(this.setNewPasswordUrl, {code, newPassword, username});
  }

  getCode(username: string): Observable<string> {
    return this.http.post<string>(this.getVerificationCodeUrl, username, httpOptions);
  }
}
