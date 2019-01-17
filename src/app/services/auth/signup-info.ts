import {Gender} from '../../models/user';

export class SignUpInfo {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  gender: Gender;
  date: string;

  constructor(firstname?: string, lastname?: string, gender?: Gender, username?: string, password?: string, date?: string) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.username = username;
    this.password = password;
    this.gender = gender;
    this.date = date;
  }


}
