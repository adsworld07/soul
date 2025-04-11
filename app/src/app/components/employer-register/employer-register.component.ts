import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employer-register',
  templateUrl: './employer-register.component.html',
  styleUrls: ['./employer-register.component.css'],
})
export class EmployerRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitting = false;
  registrationError: string | null = null;
  private baseUrl: string;
  constructor(private fb: FormBuilder, private router: Router) {
    this.baseUrl = !location.toString().includes('localhost')
      ? 'https://hiyrnow.in/backend'
      : 'http://localhost:5500';
  }
  ngOnInit(): void {
    this.initForm();
  }
  private initForm(): void {
    this.registerForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ],
        ],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            // Add additional password strength validation
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }
  // Custom validator to check if passwords match
  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    // Only validate if both fields are not empty
    if (password?.value && confirmPassword?.value) {
      return password.value === confirmPassword.value
        ? null
        : { passwordMismatch: true };
    }
    return null;
  }
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }
    this.submitting = true;
    this.registrationError = null;
    try {
      const userData = {
        username: this.registerForm.get('username')?.value ?? '',
        email: this.registerForm.get('email')?.value ?? '',
        phone: this.registerForm.get('phone')?.value ?? '',
        password: this.registerForm.get('password')?.value ?? '',
        role: 'Recruiter',
      };
      const response = await this.registerUser(userData);
      if (response && response.status === true) {
        this.router.navigate(['login']);
        alert('Registerd succesfylly! \n Please login to access your account');
      } else {
        this.registrationError =
          response?.message || 'Registration failed. Please try again.';
      }
    } catch (error) {
      this.registrationError =
        'An unexpected error occurred. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  private async registerUser(user: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/register`, {
        method: 'POST',
        body: JSON.stringify(user),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  // Convenience getters with null checks
  get username() {
    return this.registerForm?.get('username') || null;
  }
  get email() {
    return this.registerForm?.get('email') || null;
  }
  get phone() {
    return this.registerForm?.get('phone') || null;
  }
  get password() {
    return this.registerForm?.get('password') || null;
  }
  get confirmPassword() {
    return this.registerForm?.get('confirmPassword') || null;
  }

  // Helper methods for template validation checks
  isCompanyNameInvalid(): boolean {
    const control = this.username;
    return !!(control && control.invalid && control.touched);
  }
  isEmailInvalid(): boolean {
    const control = this.email;
    return !!(control && control.invalid && control.touched);
  }
  isPhoneInvalid(): boolean {
    const control = this.phone;
    return !!(control && control.invalid && control.touched);
  }
  isPasswordInvalid(): boolean {
    const control = this.password;
    return !!(control && control.invalid && control.touched);
  }
  isConfirmPasswordInvalid(): boolean {
    return !!(
      this.registerForm?.hasError('passwordMismatch') &&
      this.confirmPassword?.touched
    );
  }
}