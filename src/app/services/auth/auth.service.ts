import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthLoginInfo} from './login-info';
import {SignUpInfo} from './signup-info';
import {JwtResponse} from './jwt-response';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = 'http://localhost:8080/api/auth/signin';
  private signUpUrl = 'http://localhost:8080/api/auth/signup';

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
  signUp(info: SignUpInfo): Observable<string> {
    return this.http.post<string>(this.signUpUrl, info, httpOptions);
  }
}
