import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobPostingService } from '../../services/job-posting.service';
import { UserService } from '../../services/user.service';
import { finalize } from 'rxjs/operators';

interface Interview {
  _id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  startDateTime: string;
}

interface Assignment {
  _id: string;
  status: 'sent' | 'submitted' | 'evaluated';
  title: string;
}

interface JobApplication {
  _id: string;
  status: 'applied' | 'shortlisted' | 'interviewing' | 'rejected' | 'accepted';
  title: string;
  company: string;
  location: string;
  dateApplied: string;
  updatedAt: string;
  jobSource: string;
  coverLetter: string;
  interviews: Interview[];
  assignment: Assignment;
  jobPosting: string;
  jobPostingDetails: any;
  comments: any[];
}

@Component({
  selector: 'app-applied-jobs-list',
  templateUrl: './applied-jobs-list.component.html'
})
export class AppliedJobsListComponent implements OnInit {
  appliedJobs: JobApplication[] = [];
  isLoading = true;
  error: string | null = null;
  filterStatus = 'all';
  searchTerm = '';
  applicationID='';
  constructor(
    private jobApplicationService: JobPostingService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserApplications();
  }

  private loadUserApplications(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.findLoggedUser()
      .then(user => {
        if (user) {
          this.fetchAppliedJobs(user._id);
        } else {
          this.error = 'Please log in to view your applications';
        }
      })
      .catch(() => {
        this.error = 'Failed to load user data';
      });
  }

  private fetchAppliedJobs(userId: string): void {
    this.jobApplicationService.getAllJobsAppliedByUser(userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        (jobs) => {
          this.appliedJobs = jobs;
          this.sortApplicationsByDate();
        },
        () => {
          this.error = 'Failed to load applications';
        }
      );
  }

  private sortApplicationsByDate(): void {
    this.appliedJobs.sort((a, b) => 
      new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    );
  }

  getStatusColor(status: 'applied' | 'shortlisted' | 'interviewing' | 'accepted' | 'rejected'): string {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interviewing: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getFilteredJobs(): JobApplication[] {
    return this.appliedJobs
      .filter(job => this.filterStatus === 'all' || job.status === this.filterStatus)
      .filter(job => 
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getUpcomingInterview(interviews: Interview[]): Interview | null {
    if (!interviews?.length) return null;
    
    const futureInterviews = interviews
      .filter(interview => 
        interview.status === 'scheduled' && 
        new Date(interview.startDateTime) > new Date()
      )
      .sort((a, b) => 
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      );

    return futureInterviews[0] || null;
  }

  formatInterviewDate(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getApplicationDuration(dateApplied: string): string {
    const days = Math.floor((new Date().getTime() - new Date(dateApplied).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  getInterviewingCount(): number {
    return this.appliedJobs.filter(job => job.status === 'interviewing').length;
  } 

  getShortlistedCount(): number {
    return this.appliedJobs.filter(job => job.status === 'shortlisted').length;
  }
  getAcceptedCount(): number {
    return this.appliedJobs.filter(job => job.status === 'accepted').length;
  }
  refresh(): void {
    this.loadUserApplications();
  }

  viewJobDetails(applicationID: string): void {
    this.router.navigate(['/ApplicationDetails', applicationID]);
  }
}