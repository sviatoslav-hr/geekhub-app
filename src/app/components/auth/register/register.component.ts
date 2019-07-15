import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {SignUpInfo} from '../../../services/auth/signup-info';
import {LocalStorageService} from '../../../services/local-storage.service';
import {Month, months} from '../../../const/months';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';

const MIN_BIRTH_YEAR = 1900;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private storageService: LocalStorageService,
    private router: Router,
    private fb: FormBuilder
  ) {
  }

  days: number[];
  years: number[];
  months: Month[];
  signupForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    gender: ['-1', [Validators.required, Validators.pattern('^[0-9]+$')]],
    birthDay: ['-1', [Validators.required, Validators.pattern('^[0-9]+$')]],
    birthMonth: ['-1', [Validators.required, Validators.pattern('^[0-9]+$')]],
    birthYear: ['-1', [Validators.required, Validators.pattern('^[0-9]+$')]],
  });
  loading = false;
  errorMessage = '';

  static generateArray(from: number, to: number) {
    const arr: number[] = [];
    for (let i = from; i <= to; i++) {
      arr.push(i);
    }
    return arr;
  }

  static daysInMonth(m: number, y: number): number {
    m = +m;
    y = +y;
    switch (m) {
      case 2 :
        return y % 4 === 0 ? 29 : 28;
      case 9 :
      case 4 :
      case 6 :
      case 11 :
        return 30;
      default :
        return 31;
    }
  }

  ngOnInit() {
    this.years = RegisterComponent.generateArray(MIN_BIRTH_YEAR, new Date().getFullYear()).reverse();
    this.months = months;
    this.days = RegisterComponent.generateArray(1, 31);
  }

  changeDaysOfMonth() {
    this.days = RegisterComponent.generateArray(1, RegisterComponent
      .daysInMonth(this.signupForm.controls['birthMonth'].value, this.signupForm.controls['birthYear'].value));
  }

  isDateValid(d, m, y) {
    return m > 0 && m <= 12 && d > 0 && d <= RegisterComponent.daysInMonth(m, y);
  }

  onSubmit() {
    console.log(this.signupForm);
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls)
        .forEach(controlName => this.signupForm.controls[controlName].markAsTouched());
      return;
    } else {
      const birthDate = this.signupForm.controls['birthYear'].value
        + '-' + this.signupForm.controls['birthMonth'].value + '-'
        + this.signupForm.controls['birthDay'].value;
      const info = new SignUpInfo();
      info.firstname = this.signupForm.controls['firstname'].value;
      info.lastname = this.signupForm.controls['lastname'].value;
      info.username = this.signupForm.controls['email'].value;
      info.password = this.signupForm.controls['password'].value;
      info.gender = this.signupForm.controls['gender'].value;
      info.date = birthDate;
      this.loading = true;
      this.authService.signUp(info).subscribe(
        data => {
          this.loading = false;
          console.log(data);
          this.storageService.username = info.username;
          this.authService.storePassword(info.password);
          this.router.navigate(['/verify']);
        },
        error => {
          this.loading = false;
          console.log(error);
          this.errorMessage = error.error.message;
        }
      );
    }
  }

  isValid(control: AbstractControl): boolean {
    return control.touched && control.invalid;
  }
}
