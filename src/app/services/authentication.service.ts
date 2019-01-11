import {Injectable} from '@angular/core';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authenticated = false;
  loggedUser: User = null;

  constructor() {
  }
}
