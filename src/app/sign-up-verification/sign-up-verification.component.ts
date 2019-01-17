import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-up-verification',
  templateUrl: './sign-up-verification.component.html',
  styleUrls: ['./sign-up-verification.component.css']
})
export class SignUpVerificationComponent implements OnInit {

  username: string;
  code: number;
  constructor() { }

  ngOnInit() {
  }

  // onSubmit(){
  //
  // }

}
