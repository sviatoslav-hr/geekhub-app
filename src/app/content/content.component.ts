import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  constructor(
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
  }

}
