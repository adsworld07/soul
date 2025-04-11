import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { JobPostingService } from '../../services/job-posting.service';
import { userDetails } from '../../models/userDetails.model.client';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleInterviewModalComponent } from '../schedule-interview-modal/schedule-interview-modal.component';
import { AssignmentModalComponent } from '../assignment-modal/assignment-modal.component';
interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

@Component({
  selector: 'app-job-application',
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.css']
})
export class JobApplicationComponent implements OnInit {
  userId!: string;
  jobId!: string;
  user: userDetails['user'] | undefined;
  experiences: userDetails['experiences'] = [];
  education: userDetails['education'] = [];
  skills: userDetails['skill'] = [];
  projects: userDetails['project'] = [];
  resume: any[] = [];
  jobApplication: any;
  jobDetails: any;
  errorMessage!: string;
  loading = true;
  comments: Comment[] = [];
  commentForm: FormGroup;
  showActionModal = false;
  url:string;
  applicationId!:string;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private jobPostingService: JobPostingService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.commentForm = this.fb.group({
      commentText: ['', Validators.required]
    });


    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base;
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.jobId = params.get('jobId') || '';
      this.userId = params.get('userId') || '';
      
      if (this.jobId && this.userId) {
        this.fetchJobApplication();
        this.fetchUserDetails();
        this.fetchJobDetails();
        // this.fetchComments();
      } else {
        this.errorMessage = 'Job ID or User ID is missing.';
        this.loading = false;
      }
    });
  }
  openScheduleInterviewModal(): void {
    const dialogRef = this.dialog.open(ScheduleInterviewModalComponent, {
      width: '500px',
      data: { 
        jobTitle: this.jobDetails.title,
        applicantName: `${this.user?.firstName} ${this.user?.lastName}`,
        applicantEmail: this.user?.email
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleInterview(result);
      }
    });
  }
 // Modal management
 openActionModal() {
  this.showActionModal = true;
}

closeActionModal() {
  this.showActionModal = false;
}
  scheduleInterview(interviewDetails: any): void {
    // Here you would typically call a service method to handle the API request
    this.jobPostingService.scheduleInterview(this.jobApplication._id, interviewDetails)
      .subscribe(
        response => {
          this.jobApplication.status = 'interviewing';
          this.toastr.success('Interview scheduled successfully');
        },
        error => {
          this.toastr.error('Error scheduling interview');
        }
      );
  }
  fetchJobApplication(): void {
    this.jobPostingService.getJobApplicationByJobIdAndUserId(this.jobId, this.userId)
      .subscribe(
        (data) => {
          this.jobApplication = data;
          this.applicationId = this.jobApplication?._id;

            // Ensure that applicationId is set before calling fetchComments
        if (this.applicationId) {
          this.fetchComments();
        }
          this.loading = false;
        },
        (error) => {
          this.errorMessage = 'Error fetching job application: ' + error.message;
          this.loading = false;
        }
      );
  }
  fetchComments(): void {
    this.http.get<Comment[]>(`${this.url}/api/job-applications/${this.applicationId}/comments`).subscribe(
      (comments) => {
        this.comments = comments;
      },
      (error) => {
        this.toastr.error('Error fetching comments');
        console.error('Error fetching comments:', error);
      }
    );
  }

  addComment(): void {
    if (this.commentForm.valid) {
      const commentText = this.commentForm.get('commentText')?.value;
      
      this.http.post<Comment>(`${this.url}/api/job-applications/${this.applicationId}/comments`, { text: commentText }).subscribe(
        (newComment) => {
          this.comments.unshift(newComment);
          this.commentForm.reset();
          this.toastr.success('Comment added successfully');
        },
        (error) => {
          this.toastr.error('Error adding comment');
          console.error('Error adding comment:', error);
        }
      );
    }
  }
  fetchUserDetails(): void {
    this.userService.getUserDetails(this.userId).subscribe(
      (response: { data: { user: any, experiences: any[], education: any[], skills: any[], projects: any[] } }) => {
        const { user, experiences, education, skills, projects } = response.data;
  
        this.user = user || null;
        this.experiences = experiences || [];
        this.education = education || [];
        this.skills = skills || [];
        this.projects = projects || [];
  
        this.fetchUserResume();
      },
      (error: any) => {
        console.error('Error fetching user details:', error.message || error);
      }
    );
  }
  

  fetchUserResume(): void {
    this.userService.getUserResume(this.userId).subscribe(
      (response: any[]) => {
        if (response.length > 0) {
          const latestFile = response[response.length - 1];
          this.resume = [{
            filename: latestFile.filename,
            originalname: latestFile.originalname,
            contentType: latestFile.contentType
          }];
        }
      },
      error => {
        console.error('Error fetching resume:', error);
      }
    );
  }

  fetchJobDetails(): void {
    this.jobPostingService.getJobPostingById(this.jobId).subscribe(
      (data) => {
        this.jobDetails = data;
      },
      (error) => {
        console.error('Error fetching job details:', error);
      }
    );
  }

  updateStatus(newStatus: string): void {
    this.jobPostingService.updateApplicationStatus(this.jobApplication._id, newStatus)
      .subscribe(
        response => {
          this.jobApplication.status = newStatus;
          this.toastr.success('Application status updated successfully');
        },
        error => {
          this.toastr.error('Error updating application status');
        }
      );
  }

  downloadResume(filename: string, contentType: string): void {
    this.userService.downloadPDF(filename, this.userId).subscribe(
      (res: Blob) => {
        const file = new Blob([res], { type: contentType });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      },
      error => {
        this.toastr.error('Error downloading resume');
      }
    );
  }


  openAssignmentModal(): void {
    const dialogRef = this.dialog.open(AssignmentModalComponent, {
      width: '500px',
      data: { 
        jobTitle: this.jobDetails.title,
        applicantName: `${this.user?.firstName} ${this.user?.lastName}`,
        applicantEmail: this.user?.email
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendAssignment(result);
      }
    });
  }

  sendAssignment(assignmentDetails: any): void {
    const assignment = {
      ...assignmentDetails,
      jobApplicationId: this.applicationId,
      userId: this.userId,
      applicantEmail: this.user?.email,
      sentDate: new Date(),
      deadline: new Date(Date.now() + (assignmentDetails.deadlineDays * 24 * 60 * 60 * 1000))
    };

    this.jobPostingService.sendAssignment(assignment).subscribe(
      response => {
        this.jobApplication.status = 'assignment_sent';
        this.toastr.success('Assignment sent successfully');
      },
      error => {
        this.toastr.error('Error sending assignment');
      }
    );
  }


  
}