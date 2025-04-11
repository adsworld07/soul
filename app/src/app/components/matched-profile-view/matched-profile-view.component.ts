import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { userDetails } from '../../models/userDetails.model.client';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-matched-profile-view',
  templateUrl: `./matched-profile-view.component.html`,
  styleUrls: ['./matched-profile-view.component.css']
})
export class MatchedProfileViewComponent implements OnInit {
  jobId: string | null;
  userId: string = '';
  user: userDetails['user'] | undefined;
  loading = false;
  error: string | null = null;
  url: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.jobId = this.route.snapshot.paramMap.get('jobId');
    this.userId = this.route.snapshot.paramMap.get('userId') ?? '';

   
   
  }

  ngOnInit() {
    this.fetchUserDetails();
  }

  fetchUserDetails(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getUserDetails(this.userId ,'viewprofile').subscribe({
      next: (data: userDetails) => {
        this.user = data.user;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching user details:', error);
        this.error = 'Failed to fetch user details';
        this.loading = false;
      }
    });
  }

  sendJobDescription() {
    if (!this.jobId || !this.user?.email) {
      console.error('Missing jobId or user email');
      return;
    }

    const payload = {
      email: this.user.email,
      jobLink: `https://hiyrnow.in/job/${this.jobId}`
    };

    this.loading = true;
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
      // http://localhost:5500
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base  
    this.http.post(this.url +'/api/job-description/send', payload).subscribe({
      next: (response) => {
        console.log('Job description sent successfully');
        this.loading = false;
        // TODO: Add success notification here
      },
      error: (error) => {
        console.error('Error sending job description:', error);
        this.loading = false;
        this.error = 'Failed to send job description';
        // TODO: Add error notification here
      }
    });
  }

  shareProfile(platform: 'linkedin' | 'twitter' | 'whatsapp') {
    if (!this.userId) {
      console.error('User ID is required for sharing');
      return;
    }

    const profileUrl = `https://hiyrnow.in//profile-seeker/${this.userId}`;
    let shareUrl = '';

    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=  ${profileUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent('Check out this profile!')}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this profile: ${profileUrl}`)}`;
        break;
    }

    // Open share dialog in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}