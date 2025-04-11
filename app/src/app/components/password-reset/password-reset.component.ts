import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr'; // Optional, for notifications

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {
  requestForm!: FormGroup;
  resetForm!: FormGroup;
  isTokenSent = false;
  isToken=false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Initialize forms
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      token: [''],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    // Check for token in URL
    this.route.params.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.isTokenSent = true;
        this.isToken = true;
        this.resetForm.patchValue({ token });
      }
    });
  }

  // Request password reset link
  requestPasswordReset() {
    if (this.requestForm.valid) {
      this.userService.requestPasswordReset(this.requestForm.value.email).subscribe(
        () => {
          this.toastr.success('Password reset link sent to your email');
          this.isTokenSent = true;
        },
        (error) => {
          const errorMessage = error.error?.error || 'Error sending password reset link';
          alert(errorMessage);
          this.toastr.error(errorMessage);
          console.error('Error:', error);
        }
      );
    } else {
      this.toastr.warning('Please enter a valid email address');
    }
  }

  // Reset password with token
  resetPassword() {
    if (this.resetForm.invalid) {
      this.toastr.warning('Please fill out all fields correctly');
      return;
    }

    if (this.resetForm.value.newPassword !== this.resetForm.value.confirmPassword) {
      this.toastr.warning('Passwords do not match!');
      return;
    }

    this.userService.resetPassword(this.resetForm.value).subscribe(
      () => {
        this.toastr.success('Password has been reset successfully');
        this.isTokenSent = false;
        this.router.navigate(['/login']);
      },
      (error) => {
        this.toastr.error('Error resetting password');
        console.error('Error:', error);
      }
    );
  }
}
