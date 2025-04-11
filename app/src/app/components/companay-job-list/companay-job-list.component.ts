import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { JobPostingModelClient } from '../../models/job-posting.model.client';
import { JobListingService } from '../../services/job-listing.service';
import { JobPostingService } from '../../services/job-posting.service';
import { SaveJobService } from '../../services/save-job.service';
import { UserService } from '../../services/user.service';
import { RecruiterDetailService } from '../../services/recruiter-detail.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-companay-job-list',
  templateUrl: './companay-job-list.component.html',
  styleUrls: ['./companay-job-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanayJobListComponent implements OnInit {
  private jobPostingsSubject = new BehaviorSubject<JobPostingModelClient[]>([]);
  private filterSubject = new BehaviorSubject<any>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minApplications: null
  });

  private sortSubject = new BehaviorSubject<any>({
    column: 'datePosted',
    direction: 'asc'
  });
// PVC modal properties
showPVCModal = false;
selectedJob: any = null;
selectedPVCCount: number =0 // Default selection
totalPoints: number =0 // Default (3 * 2)
userPoints: number =20 // Will be fetched from user service

  jobPostings$ = this.jobPostingsSubject.asObservable();
  filters$ = this.filterSubject.asObservable();
  sort$ = this.sortSubject.asObservable();

  filteredAndSortedJobs$!: Observable<JobPostingModelClient[]>;
  isSubmiting:boolean=false;
  isLoading = false;
  jobToDelete: JobPostingModelClient | null = null;
  stats = {
    totalJobs: 0,
    activeJobs: 0,
    jobapplicants: 0,
    averageResponseTime: 0
  };

  pageSize = 6;
  currentPage = 1;
  jobapplicants: number = 0;

  // Sort options for the UI
  sortOptions: SortOption[] = [
    { label: 'Date Posted', value: 'datePosted' },
    { label: 'Applications', value: 'totalApplications' },
    { label: 'Title', value: 'title' }
  ];

  constructor(
    private jobPostService: JobPostingService,
    private saveJobService: SaveJobService,
    private userService: UserService,
    private recruiterService: RecruiterDetailService,
    private http: HttpClient
  ) {
    this.setupFilteredJobs();
  }

  private setupFilteredJobs() {
    this.filteredAndSortedJobs$ = combineLatest([
      this.jobPostings$,
      this.filters$.pipe(debounceTime(300), distinctUntilChanged()),
      this.sort$
    ]).pipe(
      map(([jobs, filters, sort]) => {
        // Filter jobs
        let filtered = jobs.filter(job => {
          const searchMatch = !filters.search || 
            job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
            (job.description && job.description.toLowerCase().includes(filters.search.toLowerCase()));
          
          const statusMatch = !filters.status || job.status === filters.status;
          
          const dateMatch = !filters.dateFrom || !filters.dateTo || 
            (new Date(job.datePosted) >= new Date(filters.dateFrom) &&
             new Date(job.datePosted) <= new Date(filters.dateTo));
          
          const applicationsMatch = !filters.minApplications || 
            (job.totalApplications || 0) >= filters.minApplications;

          return searchMatch && statusMatch && dateMatch && applicationsMatch;
        });

        // Sort jobs
        filtered.sort((a, b) => {
          const direction = sort.direction === 'asc' ? 1 : -1;
          
          if (sort.column === 'datePosted') {
            return direction * (new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
          }
          
          if (sort.column === 'totalApplications') {
            return direction * ((b.totalApplications || 0) - (a.totalApplications || 0));
          }
          
          // Default to string comparison for other fields
          const aValue = String(a[sort.column as keyof JobPostingModelClient] || '');
          const bValue = String(b[sort.column as keyof JobPostingModelClient] || '');
          return direction * aValue.localeCompare(bValue);
        });

        return filtered;
      })
    );
  }

  ngOnInit() {
    this.loadJobs();
  }
  openPVCRequestModal(job: any) {
    this.selectedJob = job;
    this.selectedPVCCount = 3; // Reset to default
    this.calculatePoints(); // Calculate initial points
    this.showPVCModal = true;
  }
  
  closePVCModal(event: Event) {
    event.preventDefault();
    this.showPVCModal = false;
    this.selectedJob = null;
  }
  
  calculatePoints() {
    this.totalPoints = this.selectedPVCCount * 2; // 2 points per PVC
  }
  
  submitPVCRequest() {
    // Check if user has enough points
    if (this.userPoints < this.totalPoints) {
      return; // Don't proceed if not enough points
    }
    
    // Show loader
    this.isSubmiting = true;
    
    const payload = {
      jobId: this.selectedJob._id,
      // userId: this.userService.findLoggedUser(),
      pvcCount: this.selectedPVCCount,
      pointsDeducted: this.totalPoints
    };
    
    this.jobPostService.submitPvcRequest(payload).subscribe({
      next: (response) => {
        // Update local user points immediately for better UX
        this.userPoints -= this.totalPoints;
        
        // Show success message or notification
        // this.jobService.showNotification('PVC request submitted successfully!', 'success');
        alert("PVC Request Sent");
    
       
      },
      error: (error) => {
        console.error('Error submitting PVC request:', error);
        // this.jobService.showNotification('Failed to submit request. Please try again.', 'error');
        
        // Hide loader
        this.isSubmiting = false;
        
        // Optional: Show error alert
        alert("Failed to submit request");
      }
    });

     // Close modal and hide loader
     this.showPVCModal = false;
     this.selectedJob = null;
     this.isSubmiting = false;
  }



  
  async loadJobs() {
    this.isLoading = true;
    try {
        const jobs = await this.jobPostService.getAllJobPostingForUser();

        let totalApplications = 0;

        // Process jobs and calculate application counts
        for (const job of jobs) {
            if (!job.status) job.status = 'Active';
            
            // Assign total applications for the job
            job.totalApplications = job.applicationDetails?.totalApplications || 0;

            // Accumulate total applications across all jobs
            totalApplications += job.totalApplications;
        }

        // Assign the total sum after iterating
        this.jobapplicants = totalApplications;

        this.jobPostingsSubject.next(jobs);
        this.updateStats(jobs);
      
    } catch (error) {
        console.error('Error loading jobs:', error);
    } finally {
        this.isLoading = false;
    }
  }

  private updateStats(jobs: JobPostingModelClient[]) {
    this.stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'Active').length,
      jobapplicants: this.jobapplicants,
      averageResponseTime: 2.3 // This could be calculated based on actual response time data
    };
  }

  async toggleJobStatus(job: JobPostingModelClient) {
    this.isLoading = true;
    try {
      const newStatus = job.status === 'Active' ? 'Inactive' : 'Active';
      await this.jobPostService.updateJobPosting(job._id, { status: newStatus });
      
      // Update local data
      const currentJobs = this.jobPostingsSubject.value;
      const updatedJobs = currentJobs.map(j => {
        if (j._id === job._id) {
          return { ...j, status: newStatus };
        }
        return j;
      });
      
      this.jobPostingsSubject.next(updatedJobs);
      this.updateStats(updatedJobs);
      
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openDeleteConfirmation(job: JobPostingModelClient) {
    this.jobToDelete = job;
  }

  cancelDelete() {
    this.jobToDelete = null;
  }

  async confirmDelete() {
    if (!this.jobToDelete) return;
    
    const jobId = this.jobToDelete._id;
    this.isLoading = true;
    
    try {
      await this.jobPostService.deleteJobPosting(jobId);
      await this.saveJobService.deleteJobApplicationByJobPosting(jobId, 'job-portal');
      
      const updatedJobs = this.jobPostingsSubject.value.filter(job => job._id !== jobId);
      this.jobPostingsSubject.next(updatedJobs);
      this.updateStats(updatedJobs);
      
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      this.isLoading = false;
      this.jobToDelete = null;
    }
  }

  updateFilter(filterUpdate: Partial<any>) {
    this.filterSubject.next({
      ...this.filterSubject.value,
      ...filterUpdate
    });
  }

  resetFilters() {
    this.filterSubject.next({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minApplications: null
    });
  }

  updateSort(column: string) {
    const currentSort = this.sortSubject.value;
    this.sortSubject.next({
      column,
      direction: currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc'
    });
  }

  loadMore() {
    this.currentPage++;
  }
}