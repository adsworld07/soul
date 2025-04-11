// personal-info.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { State, City } from 'country-state-city';
import { IState, ICity } from 'country-state-city';
import { UserService } from '../../services/user.service';
import { languagesList } from '../../resources/language-list ';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { NgxFileDropEntry } from 'ngx-file-drop';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
  personalInfoForm!: FormGroup;
  
  user: any;
  editMode = true;
  currentStep = 1;
  userProfileLink: string | undefined;
  states: IState[] = [];
  cities: ICity[] = [];
  preferredCities: ICity[] = [];
  languageList: string[] = languagesList;
  
  genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Others', label: 'Others' }
  ];

  maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' }
  ];

  jobTypeOptions = [
    { value: 'On-site', label: 'On-site' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' }
  ];
  @ViewChild(ShareModalComponent) shareModal!: ShareModalComponent;
  isProfilePicModalOpen = false;
  profilePicUrl!: string;
  profilePicExist = false;
  imageUrl = 'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg';
  isJobSeeking = true;
  connections=2;
  experience="";
  userId: string = '';
  isCurrentUser: boolean = false;
  firstName = 'firstName';
  lastName = 'lastName';
  tagline = '';
  facebook = '';
  linkedin = '';
  github = '';
  twitter = '';
  socialContact: any[] = [];
  modaleditMode = false;
  toastr: any;
  isEditBioModalOpen: boolean = false;
  dropdownOpen: boolean = false;
  editModemodal: boolean=false;
  constructor(
    private fb: FormBuilder, 
    private userService: UserService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadUserData();
    this.loadStates();
    this.isCurrentUser= true;
  }
  toggleStatus() {
    this.isJobSeeking = !this.isJobSeeking;
    // Here you would typically update the backend
    // this.userService.updateJobSeekingStatus(this.isJobSeeking).subscribe();
  }
  initForm() {
    this.personalInfoForm = this.fb.group({
      // Personal Details (Step 1)
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      languagesKnown: [[]],
      totalExp: ['', [Validators.min(0)]],

      // Location & Job Preferences (Step 2)
      currentState: ['', Validators.required],
      currentCity: ['', Validators.required],
      // preferredState: ['', Validators.required],
      // preferredCity: ['', Validators.required],
      currentCTC: ['', [Validators.min(0)]],
      preferredCTC: ['', [Validators.min(0)]],
      // preferredJobType: ['', Validators.required],
      // preferredJobs: [''],
      noticePeriod: ['', [Validators.min(0)]],

      // Social Links
      linkedin: ['', Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.+/)],
      github: ['', Validators.pattern(/^https?:\/\/(www\.)?github\.com\/.+/)],
      twitter: ['', Validators.pattern(/^https?:\/\/(www\.)?x\.com\/.+/)]
    });
  }

  loadUserData() {
    this.userService.findLoggedUser().then(user => {
      if (user) {
        this.user = user;
        this.personalInfoForm.patchValue({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
          gender: user.gender,
          maritalStatus: user.maritalStatus,
          languagesKnown: user.languagesKnown || [],
          currentState: user.currentState,
          currentCity: user.currentLocation,
          preferredState: user.preferredState,
          preferredCity: user.preferredLocation,
          currentCTC: user.currentCTC,
          preferredCTC: user.preferredCTC,
          preferredJobType: user.preferredJobType,
          preferredJobs: user.preferredJobs?.join(', '),
          noticePeriod: user.noticePeriod,
          totalExp: user.totalExp,
          linkedin: this.getSocialLink(user.socialContact, 'linkedin'),
          github: this.getSocialLink(user.socialContact, 'github'),
          twitter: this.getSocialLink(user.socialContact, 'twitter')
        });
        this.isCurrentUser = false;
        this.loadProfilePic(this.user._id)
        this.userProfileLink = `${window.location.origin}/profile-seeker/${this.user._id}`;
        if (user.currentState) this.loadCities(user.currentState);
        if (user.preferredState) this.loadPreferredCities(user.preferredState);
      }
    });
    // console.log(this.user)
  
    // this.updateUserInfo(this.user);
  }
  onTaglineChange(value: string): void {
    this.tagline = value.substring(0, 200); // Ensure it doesn't exceed 200 characters
  }
  private updateUserInfo(user: any) {
    if (user) {
      this.firstName = user.firstName ?? this.firstName;
      this.lastName = user.lastName ?? this.lastName;
      this.tagline = user.tagline ?? this.tagline;
      this.socialContact = user.socialContact ?? [];
      // Load profile picture
      this.loadProfilePic(user._id);
      this.profilePicUrl = user.profilePicUrl ?? this.imageUrl;
      this.profilePicExist = !!user.profilePicUrl;
      // Only fetch company details if it's a recruiter
     
    }
  }
  onProfilePicSelected(event: any) {
    // Only allow profile pic updates for current user
    if (!this.isCurrentUser) return;

    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePic', file, file.name);
      formData.append('userId', this.userId);

      this.userService.uploadProfilePic(formData).subscribe(
        response => {
          if (response.file_uploaded) {
            this.profilePicUrl = response.profilePicUrl;
            this.profilePicExist = true;
            this.closeProfilePicModal();
            alert("uploaded successfully");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        },
        error => console.error('Error uploading file:', error)
      );
    }
  }

  droppedProfilePic(files: NgxFileDropEntry[]) {
    // Only allow profile pic updates for current user
    if (!this.isCurrentUser) return;

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const formData = new FormData();
          formData.append('profilePic', file, file.name);
          formData.append('userId', this.userId);

          this.userService.uploadProfilePic(formData).subscribe(
            response => {
              if (response.file_uploaded) {
                this.profilePicUrl = response.profilePicUrl;
                this.profilePicExist = true;
                this.closeProfilePicModal();
                alert("uploaded successfully");
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            },
            error => console.error('Error uploading file:', error)
          );
        });
      }
    }
  }

  loadProfilePic(userId: string): void {
    this.userService.getProfilePic(userId).subscribe(
      (data: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.profilePicUrl = reader.result as string;
          this.profilePicExist = true;
        };
        reader.readAsDataURL(data);
      },
      error => console.error('Error fetching profile picture:', error)
    );
  }

  saveBio() {
    // Only allow bio updates for current user
    // if (!this.isCurrentUser) return;

    const updateduser = {
      'tagline': this.tagline,
    };
    this.isEditBioModalOpen = false;
    this.userService.updateUserProfile(updateduser)
      .then((updatedUser) => {
        console.log('Update success');
        window.location.reload();
      });
  }

  // UI helper methods
  editBio() {
    // if (this.isCurrentUser) {
      this.editModemodal = true;
    // }
  }

  cancelmodal() {
    this.editMode = false;
    this.isEditBioModalOpen = false;
  }

  openProfilePicModal() {
    // if (this.isCurrentUser) {
      this.isProfilePicModalOpen = true;
      this.dropdownOpen = false;
    // }
  }

  toggleDropdown() {
    if (this.isCurrentUser) {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }

  openEditBioModal() {
    // if (this.isCurrentUser) {
      this.isEditBioModalOpen = true;
      this.dropdownOpen = false;
    // }
  }

  closeEditBioModal() {
    this.isEditBioModalOpen = false;
  }

  closeProfilePicModal() {
    this.isProfilePicModalOpen = false;
  }

  checkHidden(url: string): boolean {
    return !url;
  }

  shareProfile(): void {
    this.shareModal.openShareModal();
  }

  getSocialLink(socialContact: any[], type: string): string {
    return socialContact?.find(s => s.socialtype === type)?.url || '';
  }

  loadStates() {
    this.states = State.getStatesOfCountry('IN');
  }

  loadCities(stateCode: string) {
    this.cities = City.getCitiesOfState('IN', stateCode);
  }

  loadPreferredCities(stateCode: string) {
    this.preferredCities = City.getCitiesOfState('IN', stateCode);
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  previousStep() {
    this.currentStep--;
  }

  validateCurrentStep(): boolean {
    const currentStepControls = this.getCurrentStepControls();
    currentStepControls.forEach(controlName => {
      const control = this.personalInfoForm.get(controlName);
      control?.markAsTouched();
    });

    return currentStepControls.every(controlName => 
      !this.personalInfoForm.get(controlName)?.invalid
    );
  }

  getCurrentStepControls(): string[] {
    return this.currentStep === 1 
      ? ['username', 'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'maritalStatus']
      : ['currentState', 'currentCity', 'preferredState', 'preferredCity', 'preferredJobType' ];
  }

  addLanguage(language: string) {
    if (language && !this.personalInfoForm.value.languagesKnown.includes(language)) {
      const currentLanguages = this.personalInfoForm.value.languagesKnown;
      this.personalInfoForm.patchValue({ 
        languagesKnown: [...currentLanguages, language] 
      });
    }
  }

  removeLanguage(index: number) {
    const currentLanguages = this.personalInfoForm.value.languagesKnown;
    currentLanguages.splice(index, 1);
    this.personalInfoForm.patchValue({ languagesKnown: currentLanguages });
  }

  save() {
    if (this.personalInfoForm.valid) {
      const formValue = this.personalInfoForm.value;
      const updatedUser = {
        ...formValue,
        socialContact: [
          { socialtype: 'linkedin', url: formValue.linkedin },
          { socialtype: 'github', url: formValue.github },
          { socialtype: 'twitter', url: formValue.twitter }
        ],
        preferredJobs: formValue.preferredJobs 
          ? formValue.preferredJobs.split(',').map((job: string) => job.trim())
          : []
      };

      this.userService.updateUserProfile(updatedUser)
        .then(() => {

          this.editMode = false;
          console.log("cji",this.editMode)
          window.location.reload();
        })
        .catch(error => {
          console.error('Update error:', error);
        });
    } else {
      this.personalInfoForm.markAllAsTouched();
    }
  }
  cancel(){
    this.editMode = !this.editMode;
  }
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.currentStep = 1;
  }
}