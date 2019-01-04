import {Component, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userList: string[];

  constructor(
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(value => {
      this.userList = [];
      console.log('inside subscribe');
      for (const user of value) {
        console.log('inside cycle');
        this.userList.push(user.firstName);

      }
    });
  }
}
