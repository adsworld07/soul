import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PricingService } from 'src/app/services/pricing.service';
interface PricingTier {
  points: number;
  price: number;
  profiles: number;
  popular?: boolean;
  features?: string[];
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styles: [`
    .pricing-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .gradient-text {
      background: linear-gradient(45deg, #4F46E5, #7C3AED);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .pricing-card {
      transition: all 0.3s ease;
    }

    .pricing-card:hover {
      transform: translateY(-5px);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      width: 90%;
      max-width: 1000px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .info-card {
      transition: transform 0.2s;
    }

    .info-card:hover {
      transform: translateY(-2px);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .form-section {
      border-radius: 1rem;
      padding: 2rem;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .next-steps {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 1rem;
      padding: 1.5rem;
    }

    .next-steps-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .step-number {
      background: linear-gradient(45deg, #4F46E5, #7C3AED);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .input-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: block;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #7C3AED;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    .form-select {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      background-color: white;
      transition: all 0.2s;
    }

    .form-select:focus {
      outline: none;
      border-color: #7C3AED;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    .submit-btn {
      background: linear-gradient(45deg, #4F46E5, #7C3AED);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }

    .submit-btn:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class PricingComponent implements OnInit {
  showPointsModal = false;
  showCustomModal = false;
  showRequestForm = false;
  selectedTier: PricingTier | null = null;
  isSubmitting = false;
  submitError = '';
  submitSuccess = '';
  pricingTiers: PricingTier[] = [
    {
      points: 50,
      price: 25000,
      profiles: 16,
      features: [
        'Applied User Profiles',
        'Database Access for 16 Users',
        'PVC Verifications',
        'AI Skill Assessments',
        'Priority Support'
      ]
    },
    {
      points: 100,
      price: 47000,
      profiles: 16,
      popular: true,
      features: [
        'Applied User Profiles',
        'Database Access for 16 Users',
        'PVC Verifications',
        'AI Skill Assessments',
        'Priority Support',
        'Advanced Analytics'
      ]
    },
    {
      points: 200,
      price: 90000,
      profiles: 16,
      features: [
        'Applied User Profiles',
        'Database Access for 16 Users',
        'PVC Verifications',
        'AI Skill Assessments',
        'Priority Support',
        'Advanced Analytics',
        'Custom Integration Support'
      ]
    }
  ];
  
  industries = [
    'Consumer Discretionary',
    'Consumer Services',
    'Financials',
    'Industrials',
    'Information Technology',
    'Healthcare',
    'Telecommunications',
    'Energy',
    'Materials',
    'Utilities',
    'Real Estate',
    'Other'
  ];

  positions = [
    'CEO/Founder',
    'CTO/CIO',
    'HR Manager/Director',
    'Talent Acquisition Specialist',
    'Recruiter',
    'Hiring Manager',
    'Department Head',
    'Team Lead',
    'Office Manager',
    'Operations Manager',
    'Other'
  ];

  customForm: FormGroup;
  requestForm: FormGroup;

  constructor(private fb: FormBuilder,private pricingService: PricingService) {
    this.customForm = this.fb.group({
      points: ['', [Validators.required, Validators.min(201)]],
      industry: ['', Validators.required],
      position: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{10,20}$/)]],
      requirements: ['']
    });

    this.requestForm = this.fb.group({
      points: ['', [Validators.required, Validators.min(50)]],
      industry: ['', Validators.required],
      position: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{10,20}$/)]],
      requirements: ['']
    });
  }
  ngOnInit(): void {}

  selectTier(tier: PricingTier): void {
    console.log(`Selected tier: ${tier.points} points at ₹${tier.price}`);
    this.selectedTier = tier;
    this.requestForm.patchValue({
      points: tier.points
    });
    this.showRequestForm = true;
  }

  showCustomQuoteModal(): void {
    this.showCustomModal = true;
    this.customForm.patchValue({
      points: 201 // Minimum required points for custom quote
    });
  }

  closeCustomQuote(): void {
    this.showCustomModal = false;
    this.customForm.reset();
    this.submitError = '';
    this.submitSuccess = '';
  }

  closeRequestForm(): void {
    this.showRequestForm = false;
    this.selectedTier = null;
    this.requestForm.reset();
    this.submitError = '';
    this.submitSuccess = '';
  }

  submitRequest(): void {
    if (this.requestForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      
      this.pricingService.submitRequest(this.requestForm.value)
        .subscribe({
          next: (response) => {
            console.log('Form submitted successfully:', response);
            this.isSubmitting = false;
            this.submitSuccess = response.message || 'Thank you for your request! Our team will contact you shortly.';
            
            // Close the form after 3 seconds
            setTimeout(() => {
              this.requestForm.reset();
              this.showRequestForm = false;
              this.selectedTier = null;
              this.submitSuccess = '';
            }, 3000);
          },
          error: (error) => {
            console.error('Error submitting form:', error);
            this.isSubmitting = false;
            this.submitError = error.error?.message || 'An error occurred while processing your request. Please try again.';
          }
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.requestForm.controls).forEach(key => {
        const control = this.requestForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  submitCustomRequest(): void {
    if (this.customForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      
      this.pricingService.submitCustomRequest(this.customForm.value)
        .subscribe({
          next: (response) => {
            console.log('Custom quote request submitted successfully:', response);
            this.isSubmitting = false;
            this.submitSuccess = response.message || 'Thank you for your custom quote request! Our team will contact you shortly.';
            
            // Close the form after 3 seconds
            setTimeout(() => {
              this.customForm.reset();
              this.showCustomModal = false;
              this.submitSuccess = '';
            }, 3000);
          },
          error: (error) => {
            console.error('Error submitting custom quote request:', error);
            this.isSubmitting = false;
            this.submitError = error.error?.message || 'An error occurred while processing your custom quote request. Please try again.';
          }
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.customForm.controls).forEach(key => {
        const control = this.customForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}