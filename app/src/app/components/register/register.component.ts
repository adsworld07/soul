import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../../services/user.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  username!: string;
  password!: string;
  verifyPassword!: string;
  usernameExists: boolean;
  role = 'JobSeeker';
  successMsg: boolean;
  email!: string;
  constructor(private router: Router,
              private service: UserService,
              private toastr: ToastrService) {
    this.usernameExists = false;
    this.successMsg = false;
  }
  register(username: string, password: string, email: string) {
    const user = { username, password, role: this.role, email }; // Use this.role for dynamic role
    this.service
      .register(user)
      .then((res) => {
        if (res.status === true) {
          this.toastr.success('Registration successful!');
          if (this.role === 'JobSeeker') {
            this.router.navigate(['profile-seeker']);
          } else if (this.role === 'Recruiter') {
            this.router.navigate(['profile-recruiter']);
          }
        } else {
          this.usernameExists = true;
          this.successMsg = false;
          this.toastr.error('Username already exists');
        }
      })
      .catch((error) => {
        console.error('Registration error:', error);
        this.toastr.error('An error occurred during registration. Please try again.');
      });
  }
  googleLogin() {
    this.service.googleLogin();
  }
  ngOnInit() { }
}