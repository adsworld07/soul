import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-schedule-interview-modal',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="w-full max-w-lg p-4 bg-gradient-to-br from-white to-indigo-50 rounded-xl" @fadeSlideIn>
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2">
          <span class="text-indigo-600 text-2xl">👥</span>
          <h2 class="text-2xl font-bold text-indigo-600">Schedule Interview</h2>
        </div>
        <p class="text-gray-500 text-sm mt-1">Set up an interview session</p>
      </div>

      <!-- Candidate Info Card -->
      <div class="p-3 bg-white rounded-lg shadow-sm border border-indigo-100 mb-6">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {{ data.applicantName.charAt(0) }}
          </div>
          <div>
            <h3 class="font-medium text-gray-800 text-sm">{{ data.jobTitle }}</h3>
            <p class="text-gray-600 text-sm">{{ data.applicantName }}</p>
          </div>
        </div>
      </div>
      
      <form [formGroup]="interviewForm" class="space-y-3">
        <!-- Interviewer Email -->
        <div class="group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Interviewer Email
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ✉️
            </span>
            <input 
              type="email" 
              formControlName="interviewerEmail"
              class="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     text-sm"
              placeholder="interviewer@company.com">
          </div>
          <div *ngIf="isFieldInvalid('interviewerEmail')" 
               class="text-red-500 text-xs mt-1">
            Please enter a valid email address
          </div>
        </div>

        <!-- Interview Date -->
        <div class="group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Interview Date
          </label>
          <mat-form-field appearance="outline" class="w-full custom-datepicker">
            <input matInput 
              [matDatepicker]="picker" 
              formControlName="date"
              placeholder="Choose a date"
              class="py-2">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Interview Time -->
        <div class="group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Interview Time
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🕒
            </span>
            <input 
              type="time" 
              formControlName="time"
              class="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     text-sm">
          </div>
        </div>

        <!-- Duration -->
        <div class="group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ⏱️
            </span>
            <input 
              type="number" 
              formControlName="duration"
              min="15"
              max="120"
              class="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     text-sm"
              placeholder="Enter duration">
          </div>
          <p class="text-xs text-gray-500 mt-1">Between 15-120 minutes</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button 
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                   transition-all duration-200">
            Cancel
          </button>
          <button 
            (click)="onSchedule()"
            [disabled]="interviewForm.invalid"
            class="px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2">
            <span>Schedule Interview</span>
            <span *ngIf="interviewForm.valid">✨</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    ::ng-deep .custom-datepicker {
      .mat-form-field-wrapper {
        padding-bottom: 0;
        margin: 0;
      }
      .mat-form-field-outline {
        background-color: white;
      }
      .mat-form-field-flex {
        padding: 0.5rem 0.75rem !important;
        background-color: white !important;
      }
      .mat-form-field-infix {
        padding: 0.5em 0;
        border-top: 0;
      }
    }
  `]
})
export class ScheduleInterviewModalComponent {
  interviewForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ScheduleInterviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      jobTitle: string, 
      applicantName: string, 
      applicantEmail: string 
    }
  ) {
    this.interviewForm = this.fb.group({
      interviewerEmail: ['', [Validators.required, Validators.email]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      duration: [30, [
        Validators.required, 
        Validators.min(15), 
        Validators.max(120)
      ]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.interviewForm.get(fieldName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSchedule(): void {
    if (this.interviewForm.valid) {
      const formValue = this.interviewForm.value;
      const dateTime = new Date(formValue.date);
      const [hours, minutes] = formValue.time.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      const interviewDetails = {
        ...this.data,
        interviewerEmail: formValue.interviewerEmail,
        startDateTime: dateTime.toISOString(),
        duration: formValue.duration
      };

      this.dialogRef.close(interviewDetails);
    }
  }
}