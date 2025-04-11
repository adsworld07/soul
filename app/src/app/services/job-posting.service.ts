import { Injectable } from '@angular/core';
import { JobPostingModelClient } from '../models/job-posting.model.client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobPostingService {
 


  url: string;
  allJobPostingUrl: string;
  appliedjobsurl:string;
  submitPvcRequesturl: any;
  constructor(private http: HttpClient) {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base + '/api/jobPosting';
    this.allJobPostingUrl =  base + '/api/allJobPosting';
    this.appliedjobsurl=base
    this.submitPvcRequesturl= base +'/api/pvc-requests'
  }


  getJobPostingByIdAndSource(jobId: string | undefined, jobSource: string) {
    throw new Error('Method not implemented.');
  }

  submitPvcRequest(payload: any): Observable<any> {
    return this.http.post(this.submitPvcRequesturl, payload, { withCredentials: true });
  }


  getJobPostingById(jobId: string): Observable<JobPostingModelClient> {
    const url = `${this.url}/${jobId}`; // Use the correct URL format
    return this.http.get<JobPostingModelClient>(url);
  }

  scheduleInterview(applicationId: string, interviewDetails: any): Observable<any> {
    const options = { withCredentials: true };
    return this.http.post(`${this.appliedjobsurl}/api/job-applications/${applicationId}/schedule-interview`, interviewDetails, options);
  }
  getJobApplicationCounts(): Observable<any> {
    // return this.http.get(`${this.appliedjobsurl}/api/jobPosting/applications/count`);
    const url = `${this.appliedjobsurl}/api/jobPosting/applications/count`;
    return this.http.get(url, { withCredentials: true });
  }

  updateApplicationStatus(applicationId: string, status: string): Observable<any> {
    return this.http.put(`${this.appliedjobsurl}/api/job-applications/${applicationId}/status`, { status });
  }
  getJobApplicationByJobIdAndUserId(jobId: string, userId: string): Observable<any> {
    const url = `${this.appliedjobsurl}/api/jobApplication/${jobId}/user/${userId}`;
    return this.http.get(url, { withCredentials: true });
  }
  sendAssignment(assignment: any): Observable<any> {
    return this.http.post(`${this.appliedjobsurl}/api/job-applications/${assignment.jobApplicationId}/send-assignment`, assignment);
  }

  getAllJobsAppliedByUser(userId: string): Observable<any> {
    return this.http.get(`${this.appliedjobsurl}/api/user/${userId}/appliedJobs`, {
      withCredentials: true
    });
  }

  getApplicationDetailsById(applicationId: string): Observable<any> {
    const url = `${this.appliedjobsurl}/api/job-applications/${applicationId}`;
    return this.http.get(url, { withCredentials: true });
  }
  createJobPosting(jobPosting: JobPostingModelClient) {
   
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(jobPosting),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  updateJobPosting(jobPostingId: string, jobPosting: any) {
    return fetch(this.url + '/' + jobPostingId, {
      method: 'PUT',
      body: JSON.stringify(jobPosting),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  deleteJobPosting(jobPostingId: string) {
    return fetch(this.url + '/' + jobPostingId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }

  getAllJobPostingForUser() {
    return fetch(this.url, {
      credentials: 'include'
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  getAllJobPostings() {
    // console.log('in here');
    return fetch(this.allJobPostingUrl, {
      credentials: 'include'
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  getMatchedJobsByUserId(userId: string): Observable<any> {
    const url = `${this.appliedjobsurl}/api/match-jobs/${userId}`;
    return this.http.get(url, { withCredentials: true });
  }

}
