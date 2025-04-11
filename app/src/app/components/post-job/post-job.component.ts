import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { JobPostingService } from '../../services/job-posting.service';
import { UserService } from '../../services/user.service';
import { RecruiterDetailService } from '../../services/recruiter-detail.service';
import { JobPostingModelClient } from '../../models/job-posting.model.client';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.css']
})
export class PostJobComponent implements OnInit {
  jobForm!: FormGroup;
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  currentStep = 1;
  user: any;
  companyLogo: string = '/assets/default-logo.png';
  postingAsClient: boolean = false;
  companyName:string=''
  company_url:string=''
  // Properties for location selection
  filteredCities!: Observable<string[]>;
  selectedLocations: string[] = [];
  allCities: string[] = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 
    'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 
    'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 
    'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 
    'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 
    'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad', 
    'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur', 
    'Gurgaon', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 
    'Warangal', 'Mira-Bhayandar', 'Thiruvananthapuram', 'Bhiwandi', 
    'Saharanpur', 'Guntur', 'Amravati', 'Bikaner', 'Noida', 'Jamshedpur'
  ];
  locationControl = new FormControl('');
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private jobPostService: JobPostingService,
    private userService: UserService,
    private recruiterService: RecruiterDetailService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadUserData();
    this.setupCityAutocomplete();
  }

  initForm() {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      company: [''],
      company_logo: [''],
      minQualification: ['', Validators.required],
      company_url: [''],
      minSalary: [null, [ Validators.min(0)]],
      maxSalary: [null, [ Validators.min(0)]],
      minExp: [null, [Validators.required, Validators.min(0)]],
      maxExp: [null, [Validators.required, Validators.min(0)]],
      status: ['open'],
      coreSkills: this.fb.array([])
    });
  }

  get skillsFormArray() {
    return this.jobForm.get('coreSkills') as FormArray;
  }

  addSkill() {
    const skillForm = this.fb.group({
      name: ['', Validators.required],
      mustHave: [false],
      niceToHave: [false]
    });
    this.skillsFormArray.push(skillForm);
  }

  removeSkill(index: number) {
    this.skillsFormArray.removeAt(index);
  }

  validateSkills(): boolean {
    const skills = this.skillsFormArray.controls;
    const mustHaveSkills = skills.filter(skill => skill.get('mustHave')?.value).length;
    
    // Ensure there are at least 3 "Must Have" skills
    return mustHaveSkills >= 3;
  }
  
  setupCityAutocomplete() {
    this.filteredCities = this.locationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCities.filter(city => 
      city.toLowerCase().includes(filterValue) && 
      !this.selectedLocations.includes(city)
    );
  }

  onLocationSelect(event: any): void {
    const selectedCity = event.option.value;
    if (!this.selectedLocations.includes(selectedCity)) {
      this.selectedLocations.push(selectedCity);
      this.updateLocationsFormControl();
      this.locationControl.setValue('');
      this.locationInput.nativeElement.value = '';
    }
  }

  removeLocation(location: string): void {
    const index = this.selectedLocations.indexOf(location);
    if (index >= 0) {
      this.selectedLocations.splice(index, 1);
      this.updateLocationsFormControl();
    }
  }

  updateLocationsFormControl(): void {
    // this.jobForm.get('locations')!.setValue(this.selectedLocations.join(', '));
    this.jobForm.get('location')!.setValue(this.selectedLocations.join(', '));  // Changed from 'locations' to 'location'
  }

  onInputFocus(): void {
    // Trigger filtering to show all available options
    this.locationControl.setValue(this.locationControl.value);
  }

  initCoreSkills() {
    return Array(5).fill(null).map(() => this.fb.group({
      name: ['', Validators.required],
      mustHave: [false],
      niceToHave: [false]
    }));
  }
  setPostingAsClient(value: boolean) {
    this.postingAsClient = value;
    if (!value) {
      // Reset to default values when choosing default company
      this.recruiterService.findRecruiterDetailsByUserId().then((recruiter) => {
        
        this.jobForm.patchValue({ 
          company: recruiter.company,
          company_url: recruiter.companyWebsite || '',
          company_logo: this.companyLogo
        });
      });
    }
  }

  loadUserData() {
    this.userService.findLoggedUser().then((user) => {
      this.user = user;
      this.companyName= user.username;
      this.loadProfilePic(this.user._id);
      this.recruiterService.findRecruiterDetailsByUserId().then((recruiter) => {
        
        this.company_url= recruiter.companyWebsite || ''
        this.jobForm.patchValue({ 
          
          company:  this.companyName,
          company_url: recruiter.companyWebsite || ''
        });
      });
    });
  }

  loadProfilePic(userId: string): void {
    this.userService.getProfilePic(userId).subscribe(
      (data: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.companyLogo = reader.result as string;
          this.jobForm.patchValue({ company_logo: this.companyLogo });
        };
        reader.readAsDataURL(data);
      },
      error => {
        console.error('Error fetching profile picture:', error);
      }
    );
  }

  get coreSkillsFormArray() {
    return this.jobForm.get('coreSkills') as FormArray;
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.jobForm.valid || this.currentStep < 4) {
      if (this.currentStep < 4) {
        this.currentStep++;
      }
    } else {
      this.jobForm.markAllAsTouched();
      alert('Please fill out all required fields correctly before proceeding.');
    }
  }

 onSubmit() {
    if (this.jobForm.valid && this.validateSkills()) {
      const jobData: JobPostingModelClient = {
        ...this.jobForm.value,
        datePosted: new Date(),
        created_at: new Date().toISOString(),
        date: new Date().toDateString(),
        // Ensure the description is sanitized if necessary
        description: this.sanitizeHtml(this.jobForm.get('description')?.value)
      };

      this.jobPostService.createJobPosting(jobData).then(() => {
        alert('Job posted successfully!');
        this.router.navigate(['/company/job-postings']);
      }).catch(error => {
        console.error('Error posting job:', error);
        alert('An error occurred while posting the job. Please try again.');
      });
    } else {
      this.jobForm.markAllAsTouched();
      if (!this.validateSkills()) {
        alert('Please ensure at least 3 of skills are marked as "Must Have".');
      } else {
        alert('Please fill out all required fields correctly.');
      }
    }
  }

  // Add this method to sanitize HTML if needed
  sanitizeHtml(html: string): string {
    // Implement HTML sanitization logic here
    // This is a placeholder and should be replaced with actual sanitization code
    return html;
  }
}