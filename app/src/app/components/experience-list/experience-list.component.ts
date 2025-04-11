import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ExperienceService } from '../../services/experience.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Experience {
  _id?: string;
  title: string;
  company: string;
  location: string;
  startDate: { month: string; year: string };
  endDate: { month: string; year: string };
  ongoingStatus: boolean;
  description: string;
  project?: string;
  stacks: string[];
}

@Component({
  selector: 'app-experience-list',
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.css']
})
export class ExperienceListComponent implements OnInit {
  experienceForm!: FormGroup;
  experiences: Experience[] = [];
  months: string[] = [];
  years: string[] = [];
  isLoading = false;
  addMode = false;
  editMode = false;
  currentSkill = '';
  currentExperienceId?: string;

  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private experienceService: ExperienceService,
    private sanitizer: DomSanitizer
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.experienceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      company: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required, Validators.minLength(2)]],
      startDate: this.fb.group({
        month: ['', Validators.required],
        year: ['', Validators.required]
      }),
      endDate: this.fb.group({
        month: [''],
        year: ['']
      }),
      ongoingStatus: [false],
      description: ['', [Validators.required, Validators.minLength(20)]],
      project: [''],
      stacks: [[]]
    });

    // Handle ongoing status changes
    this.experienceForm.get('ongoingStatus')?.valueChanges.subscribe(isOngoing => {
      const endDateGroup = this.experienceForm.get('endDate');
      if (isOngoing) {
        endDateGroup?.get('month')?.disable();
        endDateGroup?.get('year')?.disable();
        endDateGroup?.get('month')?.setValue('');
        endDateGroup?.get('year')?.setValue('');
        endDateGroup?.get('month')?.clearValidators();
        endDateGroup?.get('year')?.clearValidators();
      } else {
        endDateGroup?.get('month')?.enable();
        endDateGroup?.get('year')?.enable();
        endDateGroup?.get('month')?.setValidators(Validators.required);
        endDateGroup?.get('year')?.setValidators(Validators.required);
      }
      endDateGroup?.get('month')?.updateValueAndValidity();
      endDateGroup?.get('year')?.updateValueAndValidity();
      this.experienceForm.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.initializeDates();
    this.loadExperiences();
  }

  private initializeDates(): void {
    const currentYear = new Date().getFullYear();
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    this.years = Array.from({ length: 75 }, (_, i) => (currentYear - i).toString());
  }

  private async loadExperiences(): Promise<void> {
    this.isLoading = true;
    try {
      const user = await this.userService.findLoggedUser();
      if (user) {
        this.experiences = await this.experienceService.findExperienceByUserId();
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      this.isLoading = false;
    }
  }

  addSkill(): void {
    if (!this.currentSkill.trim()) return;
    
    const currentStacks = this.experienceForm.get('stacks')?.value || [];
    if (!currentStacks.includes(this.currentSkill)) {
      this.experienceForm.patchValue({
        stacks: [...currentStacks, this.currentSkill.trim()]
      });
    }
    this.currentSkill = '';
  }

  removeSkill(index: number): void {
    const currentStacks = this.experienceForm.get('stacks')?.value;
    currentStacks.splice(index, 1);
    this.experienceForm.patchValue({ stacks: currentStacks });
  }

  isFormValid(): boolean {
    const form = this.experienceForm;
    if (!form) return false;

    // Check required fields
    if (!form.get('title')?.valid) return false;
    if (!form.get('company')?.valid) return false;
    if (!form.get('location')?.valid) return false;
    if (!form.get('description')?.valid) return false;

    // Check start date
    const startDate = form.get('startDate');
    if (!startDate?.get('month')?.value || !startDate?.get('year')?.value) return false;

    // Check end date only if not ongoing
    const isOngoing = form.get('ongoingStatus')?.value;
    if (!isOngoing) {
      const endDate = form.get('endDate');
      if (!endDate?.get('month')?.value || !endDate?.get('year')?.value) return false;
    }

    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      Object.keys(this.experienceForm.controls).forEach(key => {
        const control = this.experienceForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    try {
      const formData = this.experienceForm.value;
      
      // Convert ongoingStatus to boolean if it's a string
      formData.ongoingStatus = formData.ongoingStatus === true || formData.ongoingStatus === "true";
      
      // Handle stacks array properly
      if (typeof formData.stacks === 'string') {
        formData.stacks = [formData.stacks];
      } else if (!formData.stacks) {
        formData.stacks = [];
      }

      if (this.editMode && this.currentExperienceId) {
        await this.experienceService.updateExperience(this.currentExperienceId, formData);
      } else {
        await this.experienceService.createExperience(formData);
      }

      await this.loadExperiences();
      this.resetForm();
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      this.isLoading = false;
    }
  }

  editExperience(experience: Experience): void {
    this.editMode = true;
    this.addMode = true;
    this.currentExperienceId = experience._id;
    
    // Ensure ongoingStatus is boolean
    const ongoingStatus = !!experience.ongoingStatus;
    
    // Handle stacks
    const stacks = Array.isArray(experience.stacks) 
      ? experience.stacks 
      : experience.stacks ? [experience.stacks] : [];

    this.experienceForm.patchValue({
      title: experience.title,
      company: experience.company,
      location: experience.location,
      startDate: experience.startDate,
      endDate: experience.endDate,
      ongoingStatus: ongoingStatus,
      description: experience.description,
      project: experience.project,
      stacks: stacks
    });

    // Handle endDate disable if ongoing
    if (ongoingStatus) {
      const endDateGroup = this.experienceForm.get('endDate');
      endDateGroup?.get('month')?.disable();
      endDateGroup?.get('year')?.disable();
    }

    // Force form validation update
    this.experienceForm.updateValueAndValidity();
  }

  async deleteExperience(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.isLoading = true;
      try {
        await this.experienceService.deleteExperience(id);
        await this.loadExperiences();
      } catch (error) {
        console.error('Error deleting experience:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  resetForm(): void {
    this.experienceForm.reset();
    this.editMode = false;
    this.currentExperienceId = undefined;
    this.addMode = false;
    
    // Reset validators
    const endDateGroup = this.experienceForm.get('endDate');
    endDateGroup?.get('month')?.setValidators(Validators.required);
    endDateGroup?.get('year')?.setValidators(Validators.required);
    this.experienceForm.updateValueAndValidity();
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}