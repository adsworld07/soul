import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-job-application-modal',
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white w-full max-w-5xl mx-4 rounded-lg shadow-lg max-h-[85vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white p-6 border-b z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">{{ currentStep === 1 ? 'Apply for Position' : 'Application Preview' }}</h2>
            <button (click)="closeModal()" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Step 1: Cover Letter -->
        <div *ngIf="currentStep === 1" class="p-6">
          <form [formGroup]="applicationForm">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-medium mb-2">Cover Letter</label>
              <textarea 
                formControlName="coverLetter"
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
                placeholder="Write your cover letter here..."></textarea>
              <div *ngIf="applicationForm.get('coverLetter')?.touched && applicationForm.get('coverLetter')?.invalid" 
                   class="text-red-500 text-sm mt-1">
                Cover letter is required
              </div>
            </div>
            <div class="flex justify-end space-x-4">
              <button 
                (click)="skipCoverLetter()"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Skip Cover Letter
              </button>
              <button 
                (click)="nextStep()"
                [disabled]="applicationForm.get('coverLetter')?.invalid"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                Preview Application
              </button>
            </div>
          </form>
        </div>

        <!-- Step 2: Preview -->
        <div *ngIf="currentStep === 2" class="p-2">
          <div class="space-y-6">
            <!-- Profile Header -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="flex justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-2xl text-gray-600">{{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold">{{user?.firstName}} {{user?.lastName}}</h3>
                    <p class="text-gray-600">{{user?.tagline}}</p>
                    <p class="text-gray-500">{{user?.email}} • {{user?.phone}}</p>
                  </div>
                </div>
               
              </div>
            </div>
            <button 
            (click)="editProfile()"
            class="px-4 py-2 rounded-lg bg-indigo-500 text-white shadow-md transition-all duration-300 
                   hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 
                   active:scale-95 ease-in-out group flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Information</span>
          </button>
            <!-- Resume Section -->
            <div *ngIf="resume?.length > 0" class="bg-gray-50 p-6 rounded-lg">
              <div class="flex justify-between items-start mb-4">
                <h4 class="text-lg font-semibold">Resume</h4>
                <button 
                (click)="editResume()"
                class="px-4 py-2 rounded-lg bg-transparent border-2 border-indigo-500 text-indigo-600 
                       font-semibold transition-all duration-300 
                       hover:bg-indigo-500 hover:text-white 
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 
                       active:scale-95 group flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Update Resume</span>
              </button>
              </div>
              <div class="flex items-center space-x-4">
                <div *ngFor="let file of resume" class="flex items-center space-x-2">
                  <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <button 
                    (click)="downloadPdf(file.filename, file.contentType)"
                    class="text-indigo-600 hover:text-indigo-800 font-medium">
                    View Resume
                  </button>
                </div>
              </div>
            </div>

            <!-- Experience Section -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="flex justify-between items-start mb-4">
                <h4 class="text-lg font-semibold">Professional Experience</h4>
               
              </div>
              <div class="space-y-4">
                <div *ngFor="let exp of experiences" class="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                  <div class="flex justify-between">
                    <div>
                      <h5 class="font-medium">{{exp.title}}</h5>
                      <p class="text-gray-600">{{exp.company}} • {{exp.location}}</p>
                    </div>
                    <p class="text-gray-500 text-sm">
                      {{exp.startDate.month}} {{exp.startDate.year}} - {{exp.endDate.month}} {{exp.endDate.year}}
                    </p>
                  </div>
                  <div class="mt-2 text-gray-700" [innerHTML]="exp.description"></div>
                  <div class="mt-2">
                    <span *ngFor="let stack of exp.stacks" 
                          class="inline-block px-2 py-1 mr-2 mb-2 bg-gray-200 rounded-full text-sm">
                      {{stack}}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Education Section -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="flex justify-between items-start mb-4">
                <h4 class="text-lg font-semibold">Education</h4>
               
              </div>
              <div class="space-y-4">
                <div *ngFor="let edu of education" class="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                  <div class="flex justify-between">
                    <div>
                      <h5 class="font-medium">{{edu.degree}} in {{edu.fieldOfStudy}}</h5>
                      <p class="text-gray-600">{{edu.institute}} • {{edu.location}}</p>
                    </div>
                    <p class="text-gray-500 text-sm">
                      {{edu.startDate.month}} {{edu.startDate.year}} - {{edu.endDate.month}} {{edu.endDate.year}}
                    </p>
                  </div>
                  <p class="mt-1 text-gray-600">Grade: {{edu.grade}}</p>
                  <div class="mt-2 text-gray-700" [innerHTML]="edu.description"></div>
                </div>
              </div>
            </div>

            <!-- Skills Section -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="flex justify-between items-start mb-4">
                <h4 class="text-lg font-semibold">Skills</h4>
               
              </div>
              <div class="flex flex-wrap gap-2">
                <div *ngFor="let skill of skills" 
                     class="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center space-x-2">
                  <span>{{skill.skillName}}</span>
                  <span class="text-gray-500">({{skill.skillLevel}})</span>
                </div>
              </div>
            </div>

            <!-- Cover Letter -->
            <div *ngIf="applicationForm.get('coverLetter')?.value" class="bg-gray-50 p-6 rounded-lg">
              <div class="flex justify-between items-start mb-4">
                <h4 class="text-lg font-semibold">Cover Letter</h4>
                <button 
                  (click)="previousStep()"
                  class="text-indigo-600 hover:text-indigo-800">
                  Edit Cover Letter
                </button>
              </div>
              <p class="text-gray-700 whitespace-pre-line">{{applicationForm.get('coverLetter')?.value}}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end mt-6">
            <button 
              (click)="submitApplication()"
              class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Submit Application
            </button>
          </div>
        </div>
      </div>
      <app-edit-profile-modal
  [isOpen]="showEditModal"
  [editMode]="editMode"
  [userData]="user"
  
   (closeModalEvent)="handleEditModalClose()"
  (updateComplete)="handleProfileUpdate($event)">
</app-edit-profile-modal>
    </div>
  `
})
export class JobApplicationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() job: any;
  user: any;
  userId!: string; 
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() submitEvent = new EventEmitter<{coverLetter: string}>();
  @Output() editProfileEvent = new EventEmitter<void>();
  @Output() editResumeEvent = new EventEmitter<void>();
  @Output() editExperienceEvent = new EventEmitter<void>();
  @Output() editEducationEvent = new EventEmitter<void>();
  @Output() editSkillsEvent = new EventEmitter<void>();
  showEditModal: boolean = false;
  editMode: 'resume' | 'profile' = 'profile';
  
  currentStep: number = 1;
  applicationForm: FormGroup;
  resume: any[] = [];
  experiences: any[] = [];
  education: any[] = [];
  skills: any[] = [];
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.applicationForm = this.fb.group({
      coverLetter: ['']
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading = true;
    this.userService.findLoggedUser()
      .then(user => {
        this.user = user;
        this.userId = this.user._id;
        this.fetchUserDetails();
        this.toastr.success('Profile data loaded successfully');
      })
      .catch(error => {
        this.toastr.error('Failed to load user data');
        console.error('Error loading user data:', error);
      })
      .finally(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  fetchUserDetails(): void {
    const resumeRequest = this.userService.getUserResume(this.userId);
    const detailsRequest = this.userService.getUserDetails(this.userId);

    Promise.all([resumeRequest.toPromise(), detailsRequest.toPromise()])
      .then(([resumeData, userResponse]: [any, any]) => {
        // Handle resume data
        const userDetails = userResponse.data
        console.log("============",userDetails)
        if (resumeData && resumeData.length > 0) {
          const latestFile = resumeData[resumeData.length - 1];
          this.resume = [{
            filename: latestFile.filename,
            originalname: latestFile.originalname,
            contentType: latestFile.contentType
          }];
        }

        // Handle user details
        if (userDetails) {
          this.user = userDetails.user;
          this.experiences = userDetails.experiences || [];
          this.education = userDetails.education || [];
          this.skills = userDetails.skill || [];
        }

        this.toastr.success('Application details loaded successfully');
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        this.toastr.error('Failed to load application details');
      });
  }

  handleEditModalClose(): void {
    this.showEditModal = false;
    this.loadUserData(); // Reload all data when edit modal closes
  }

  handleProfileUpdate(event: {section: string, data: any}): void {
    this.showEditModal = false;
    this.loadUserData();
    this.toastr.success('Profile updated successfully');
  }

  editProfile(): void {
    this.editMode = 'profile';
    this.showEditModal = true;
  }

  editResume(): void {
    this.editMode = 'resume';
    this.showEditModal = true;
  }

  editExperience(): void {
    this.editMode = 'profile';
    this.showEditModal = true;
  }

  editEducation(): void {
    this.editMode = 'profile';
    this.showEditModal = true;
  }

  editSkills(): void {
    this.editMode = 'profile';
    this.showEditModal = true;
  }

  skipCoverLetter(): void {
    this.applicationForm.patchValue({ coverLetter: '' });
    this.toastr.info('Proceeding without cover letter');
    this.nextStep();
  }

  downloadPdf(filename: string, contentType: string): void {
    this.userService.downloadPDF(filename, this.userId).subscribe(
      (res: Blob) => {
        const file = new Blob([res], { type: contentType });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
        this.toastr.success('Resume downloaded successfully');
      },
      error => {
        console.error('Error downloading PDF:', error);
        this.toastr.error('Failed to download resume');
      }
    );
  }

  closeModal(): void {
    this.currentStep = 1;
    this.applicationForm.reset();
    this.closeModalEvent.emit();
  }

  nextStep(): void {
    this.currentStep = 2;
  }

  previousStep(): void {
    this.currentStep = 1;
  }

  submitApplication(): void {
    this.submitEvent.emit({
      coverLetter: this.applicationForm.get('coverLetter')?.value || ''
    });
    this.toastr.success('Application submitted successfully');
    this.closeModal();
  }
}