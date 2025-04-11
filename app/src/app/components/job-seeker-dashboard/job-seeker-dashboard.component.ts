import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { JobPostingService } from '../../services/job-posting.service';
import { Chart, ChartConfiguration, ChartData, ChartTypeRegistry } from 'chart.js/auto';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

interface DashboardResponse {
  analyticsData: {
    applicationStats: {
      total: number;
      successful: number;
      rejected: number;
      pending: number;
      successRate: number;
    };
    interviewMetrics: {
      total: number;
      completed: number;
      upcoming: number;
      averageScore: number;
    };
    jobCategories: {
      frontend: number;
      backend: number;
      fullstack: number;
      devops: number;
      other: number;
    };
    monthlyApplications: {
      labels: string[];
      data: number[];
    };
  };
  integrations: {
    linkedin: boolean;
    calendar: boolean;
    videoConference: boolean;
    documents: boolean;
  };
  _id: string;
  user: string;
  __v: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-job-seeker-dashboard',
  templateUrl: './job-seeker-dashboard.component.html',
  styleUrls: ['./job-seeker-dashboard.component.css'],
})
export class JobSeekerDashboardComponent implements OnInit, AfterViewInit {
  user: any;
  isLoading = true;
  @ViewChild('applicationTrendsChart') private applicationTrendsChartRef!: ElementRef;
  @ViewChild('categoryDistributionChart') private categoryChartRef!: ElementRef;
  
  private trendsChart: Chart | null = null;
  private categoryChart: Chart | null = null;
  
  analyticsData = {
    applicationStats: {
      total: 0,
      successful: 0,
      rejected: 0,
      pending: 0,
      successRate: 0,
    },
    interviewMetrics: {
      total: 0,
      completed: 0,
      upcoming: 0,
      averageScore: 0,
    },
    jobCategories: {
      frontend: 0,
      backend: 0,
      fullstack: 0,
      devops: 0,
      other: 0,
    },
    monthlyApplications: {
      labels: [] as string[],
      data: [] as number[],
    },
  };

  integrations = {
    linkedin: false,
    calendar: false,
    videoConference: false,
    documents: false,
  };

  dashboardId: string = '';
  lastUpdated: string = '';

  constructor(
    private jobPostingService: JobPostingService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    if (!this.isLoading && this.analyticsData) {
      this.initializeCharts();
    }
  }
  private loadDashboardData(): void {
    this.isLoading = true;

    this.userService.findLoggedUser().then(
      (user) => {
        if (user && user._id) {
          this.user = user;
          this.userService.getDashboardData(user._id).subscribe({
            next: (response: DashboardResponse) => {
              this.analyticsData = response.analyticsData;
              this.integrations = response.integrations;
              this.dashboardId = response._id;
              this.lastUpdated = response.lastUpdated;
              
              this.isLoading = false;
              
              // Use setTimeout to ensure DOM is ready
              setTimeout(() => {
                this.initializeCharts();
              }, 0);

              console.log('Analytics Data:', this.analyticsData); // Debug log
            },
            error: (error) => {
              console.error('Error loading dashboard:', error);
              this.isLoading = false;
              this.snackBar.open('Failed to load dashboard data', 'Close', { 
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/login']);
        }
      },
      (error) => {
        console.error('Error finding logged user:', error);
        this.isLoading = false;
        this.router.navigate(['/login']);
      }
    );
  }

  private initializeCharts(): void {
    console.log('Initializing charts...'); // Debug log
    console.log('Chart refs:', {
      trends: this.applicationTrendsChartRef?.nativeElement,
      category: this.categoryChartRef?.nativeElement
    }); // Debug log

    if (!this.applicationTrendsChartRef?.nativeElement || !this.categoryChartRef?.nativeElement) {
      console.warn('Chart references not yet available');
      return;
    }

    // Ensure the canvas elements are visible and have dimensions
    const trendsCanvas = this.applicationTrendsChartRef.nativeElement;
    const categoryCanvas = this.categoryChartRef.nativeElement;

    if (!trendsCanvas.getContext || !categoryCanvas.getContext) {
      console.error('Canvas context not available');
      return;
    }

    // Set explicit dimensions if needed
    trendsCanvas.style.height = '300px';
    categoryCanvas.style.height = '300px';

    // Destroy existing charts if they exist
    if (this.trendsChart) {
      this.trendsChart.destroy();
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    // Add debug logs for data
    console.log('Monthly Applications Data:', {
      labels: this.analyticsData.monthlyApplications.labels,
      data: this.analyticsData.monthlyApplications.data
    });
    console.log('Job Categories Data:', this.analyticsData.jobCategories);

    const trendsConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.analyticsData.monthlyApplications.labels,
        datasets: [
          {
            label: 'Applications',
            data: this.analyticsData.monthlyApplications.data,
            borderColor: '#3498db',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
        },
      },
    };

    const categoryData: ChartData = {
      labels: Object.keys(this.analyticsData.jobCategories),
      datasets: [
        {
          data: Object.values(this.analyticsData.jobCategories),
          backgroundColor: [
            '#3498db',
            '#2ecc71',
            '#9b59b6',
            '#f1c40f',
            '#e74c3c',
          ],
        },
      ],
    };

    const categoriesConfig: ChartConfiguration = {
      type: 'doughnut',
      data: categoryData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
        },
      },
    };

    try {
      this.trendsChart = new Chart(
        trendsCanvas,
        trendsConfig as any
      );
      
      this.categoryChart = new Chart(
        categoryCanvas,
        categoriesConfig as any
      );

      console.log('Charts initialized successfully'); // Debug log
    } catch (error) {
      console.error('Error initializing charts:', error);
      this.snackBar.open('Failed to initialize charts', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }



  connectLinkedIn(): void {
    // Clear any existing state
    sessionStorage.removeItem('linkedInState');

    this.userService.initiateLinkedInAuth().subscribe({
        next: (response) => {
            if (response?.success && response?.authUrl && typeof response.state === 'string') {
                // Store state securely
                sessionStorage.setItem('linkedInState', response.state);

                // Open LinkedIn auth window
                const linkedInWindow = window.open(
                    response.authUrl,
                    'LinkedIn Login',
                    'width=600,height=600,scrollbars=yes'
                );

                // Setup message listener
                const messageHandler = (event: MessageEvent) => {
                    if (event.data.type === 'linkedin_auth') {
                        // Clean up
                        window.removeEventListener('message', messageHandler);
                        linkedInWindow?.close();

                        const storedState = sessionStorage.getItem('linkedInState');
                        if (!storedState || event.data.state !== storedState) {
                            this.handleLinkedInError('State validation failed');
                            return;
                        }

                        // Process the authorization
                        this.userService.handleLinkedInCallback(event.data.code, storedState)
                            .subscribe({
                                next: (response) => {
                                    if (response?.success) {
                                        this.handleLinkedInSuccess(response);
                                    } else {
                                        this.handleLinkedInError('Integration failed');
                                    }
                                },
                                error: (error) => this.handleLinkedInError(error.message)
                            });
                    }
                };

                window.addEventListener('message', messageHandler);

                // Cleanup if window is closed
                const checkWindow = setInterval(() => {
                    if (linkedInWindow?.closed) {
                        clearInterval(checkWindow);
                        window.removeEventListener('message', messageHandler);
                        sessionStorage.removeItem('linkedInState');
                    }
                }, 1000);
            } else {
                this.handleLinkedInError('Invalid response from LinkedIn auth');
            }
        },
        error: (error) => this.handleLinkedInError(error.message)
    });
}

private handleLinkedInSuccess(response: any): void {
    this.integrations.linkedin = true;
    this.snackBar.open('Successfully connected to LinkedIn!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
    });
    
    // Refresh dashboard data
    this.loadDashboardData();
}

private handleLinkedInError(errorMessage: string): void {
    console.error('LinkedIn connection failed:', errorMessage);
    
    this.snackBar.open(
        `LinkedIn connection failed: ${errorMessage}`, 
        'Close', 
        {
            duration: 5000,
            panelClass: ['error-snackbar']
        }
    );
    
    // Clean up
    sessionStorage.removeItem('linkedInState');
}


  syncCalendar(): void {
    // // For Google Calendar
    // const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    //   `client_id=${environment.googleClientId}&` +
    //   `redirect_uri=${environment.googleRedirectUri}&` +
    //   `scope=https://www.googleapis.com/auth/calendar&` +
    //   `response_type=code`;

    // // Open popup for calendar selection
    // const calendarWindow = window.open(googleAuthUrl, 'Calendar Integration',
    //   'width=600,height=600');

    // // Handle the OAuth callback
    // window.addEventListener('message', (event) => {
    //   if (event.data.type === 'calendar_auth') {
    //     this.userService.connectCalendar('google', event.data.code).subscribe({
    //       next: (response) => {
    //         this.integrations.calendar = true;
    //         this.snackBar.open('Calendar connected successfully', 'Close', { duration: 3000 });
    //       },
    //       error: (error) => {
    //         this.snackBar.open('Calendar connection failed', 'Close', { duration: 3000 });
    //         console.error('Calendar sync error:', error);
    //       }
    //     });
    //   }
    // });
  }

  configureVideoConference(): void {
    // const zoomAuthUrl = `https://zoom.us/oauth/authorize?` +
    //   `response_type=code&` +
    //   `client_id=${environment.zoomClientId}&` +
    //   `redirect_uri=${environment.zoomRedirectUri}`;

    // const zoomWindow = window.open(zoomAuthUrl, 'Zoom Integration',
    //   'width=600,height=600');

    // window.addEventListener('message', (event) => {
    //   if (event.data.type === 'zoom_auth') {
    //     this.userService.connectVideoConference(event.data.code).subscribe({
    //       next: (response) => {
    //         this.integrations.videoConference = true;
    //         this.snackBar.open('Video conference configured successfully', 'Close', { duration: 3000 });
    //       },
    //       error: (error) => {
    //         this.snackBar.open('Video conference configuration failed', 'Close', { duration: 3000 });
    //         console.error('Video conference config error:', error);
    //       }
    //     });
    //   }
    // });
  }

  verifyDocuments(): void {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx';

    fileInput.onchange = (event: any) => {
      const files = event.target.files;
      if (files.length) {
        this.userService.uploadDocuments(Array.from(files)).subscribe({
          next: (response) => {
            this.integrations.documents = true;
            this.snackBar.open('Documents verified successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Document verification failed', 'Close', { duration: 3000 });
            console.error('Document verification error:', error);
          }
        });
      }
    };

    fileInput.click();
  }
}
