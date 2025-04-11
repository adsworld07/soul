// auth.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Implement your authentication logic here
  isLoggedIn(): boolean {
    // Example: check if a user is authenticated, using a token or any other method
    // Replace the following line with your actual authentication check
    return localStorage.getItem('token') !== null;
  }
}
