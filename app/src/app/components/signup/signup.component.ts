import { Component } from '@angular/core';
import { trigger,state, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],


  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('cardHover', [
      state('inactive', style({
        transform: 'scale(1)'
      })),
      state('active', style({
        transform: 'scale(1.05)'
      })),
      transition('inactive => active', animate('200ms ease-out')),
      transition('active => inactive', animate('150ms ease-in'))
    ]),
    trigger('buttonPulse', [
      transition('* => *', [
        animate('2000ms ease-in-out', style({ transform: 'scale(1.05)' })),
        animate('2000ms ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class SignupComponent {
  selectedRole: 'jobseeker' | 'employer' | null = null;
  roleSelected = false;

  selectRole(role: 'jobseeker' | 'employer') {
   
    this.selectedRole = role;
    console.log(this.selectedRole)
  }

  continueToSignup() {
    if (this.selectedRole) {
      this.roleSelected = true;
    }
  }

  goBack() {
    this.roleSelected = false;
    this.selectedRole = null;
  }
}