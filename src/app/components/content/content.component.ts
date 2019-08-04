import {Component, OnInit} from '@angular/core';
import {User} from '../../models/user';
import {LocalStorageService} from '../../services/local-storage.service';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  loggedUser: User;

  isLoggedIn = false;

  constructor(
    private storageService: LocalStorageService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    if (this.storageService.token) {
      this.isLoggedIn = true;
      this.getUser();
    }
  }

  private getUser() {
    this.userService.getUserByUsername(this.storageService.username)
      .subscribe(value => this.loggedUser = value);
  }

}
