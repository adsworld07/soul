import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartTypeRegistry } from 'chart.js';
import { JobListingService } from '../../services/job-listing.service';
import { SaveJobService } from '../../services/save-job.service';
import { JobPostingService } from '../../services/job-posting.service';
import { UserService } from '../../services/user.service';
import { RecruiterDetailService } from '../../services/recruiter-detail.service';
import { HttpClient } from '@angular/common/http';
import { faBriefcase, faUsers, faCalendar, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  averageTimeToHire: string;
  offerAcceptanceRate: string;
}

interface Job {
  _id: string;
  title: string;
  location: string;
  department: string;
  company: string;
  status: 'Active' | 'Inactive';
  datePosted: Date;
  date: string;
  jobSource?: string;
  company_logo?: string;
}

interface Interview {
  id: string;
  candidateName: string;
  jobTitle: string;
  startDateTime: string;
  avatar: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  platform: string;
}

interface RecentActivity {
  type: 'application' | 'interview' | 'job' | 'offer';
  message: string;
  time: string;
  icon: string;
}

interface CalendarDay {
  day: number;
  date: string;
  hasInterview: boolean;
  isToday: boolean;
  interviews: Interview[];
}

@Component({
  selector: 'app-recruiter-dashboard',
  templateUrl: './recruiter-dashboard.component.html',
  styles: [
    `:host { display: block; }`
  ]
})
export class RecruiterDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  user: any;
  profilePicUrl: string = '';
  unreadNotifications = 0;
  activeJobsCount = 0;
  inactiveJobsCount = 0;
  totalApplications = 0;
  weeklyInterviews = 0;
  today = new Date();
  selectedPeriod = 'month';
  motivation: string = '';
  isLoading: boolean = true;
  isLoadingInterviews: boolean = false;
  noInterviewImageUrl = 'https://i.pinimg.com/736x/da/78/16/da781637c929a6ba58d6d7a71d677148.jpg';
  defaultUserImage = '../../../assets/defaultUser.jpg';
  jobPostings: Job[] = [];
  applicationCounts: { [jobId: string]: number } = {};
  jobapplicants:number =0;
  jobApplicationStats: {
    totalApplications: number;
    jobWiseCount: Array<{
      jobId: string;
      jobTitle: string;
      applicationCount: number;
    }>;
  } = {
    totalApplications: 0,
    jobWiseCount: []
  };
   currentDate: Date = new Date();
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  firstDayIndex: number = 0;
  interviews: Interview[] = []; // Add this property
  hoveredDay: number | null = null;
  selectedDay: number | null = null;
  pipelineStages = [
    { name: 'Applied', count: 0, percentage: 0 },
    { name: 'Screening', count: 0, percentage: 0 },
    { name: 'Interview', count: 0, percentage: 0 },
    { name: 'Offer', count: 0, percentage: 0 },
    { name: 'Hired', count: 0, percentage: 0 }
  ];

  // pipelineStages = [
  //   { name: 'Applied', count: 156, percentage: 100 },
  //   { name: 'Screening', count: 98, percentage: 62 },
  //   { name: 'Interview', count: 45, percentage: 29 },
  //   { name: 'Offer', count: 12, percentage: 8 },
  //   { name: 'Hired', count: 8, percentage: 5 }
  // ];

  jobs: Job[] = [
    {
      _id: "job1",
      title: "Software Engineer",
      location: "San Francisco, CA",
      department: "Engineering",
      company: "Google",
      status: "Active",
      datePosted: new Date("2024-02-15"),
      date: "2024-02-15",
      jobSource: "LinkedIn",
      company_logo: "https://logo.clearbit.com/google.com"
    },
    {
      _id: "job2",
      title: "Data Scientist",
      location: "New York, NY",
      department: "Data Science",
      company: "Meta",
      status: "Active",
      datePosted: new Date("2024-02-10"),
      date: "2024-02-10",
      jobSource: "Indeed",
      company_logo: "https://logo.clearbit.com/meta.com"
    },
    {
      _id: "job3",
      title: "Product Manager",
      location: "Remote",
      department: "Product",
      company: "Amazon",
      status: "Inactive",
      datePosted: new Date("2024-01-25"),
      date: "2024-01-25",
      jobSource: "Company Website",
      company_logo: "https://logo.clearbit.com/amazon.com"
    },
  ];

  todayInterviews: Interview[] = [
   
  ];
  upcomingInterviews: Interview[] = [];
  totalInterviews: number = 0;
  recentActivities: RecentActivity[] = [
    {
      type: 'application',
      message: 'New application for Senior Frontend Developer',
      time: '10 minutes ago',
      icon: '📝'
    },
    {
      type: 'interview',
      message: 'Interview completed with David Chen',
      time: '1 hour ago',
      icon: '👥'
    },
    {
      type: 'job',
      message: 'New job posting published: UX Designer',
      time: '2 hours ago',
      icon: '🎯'
    },
    {
      type: 'offer',
      message: 'Offer accepted by Emily Watson',
      time: '3 hours ago',
      icon: '🎉'
    }
  ];
  private intervalId: any;
  private applicationTrendsChart: Chart | null = null;
  private applicationSourcesChart: Chart | null = null;

  // Stats data for the dashboard cards
  statsData = [
    { title: 'Active Jobs', value: 0, bgColor: 'bg-purple-500', icon: faBriefcase },
    { title: 'Total Applications', value: 0, bgColor: 'bg-blue-500', icon: faUsers },
    { title: 'Interviews This Week', value: 0, bgColor: 'bg-green-500', icon: faCalendar },
    { title: 'Hire Rate', value: '0%', bgColor: 'bg-orange-500', icon: faChartLine }
  ];


  constructor(
    private router: Router,
    private jobService: JobListingService,
    private saveJobService: SaveJobService,
    private jobPostService: JobPostingService,
    private userService: UserService,
    private recruiterService: RecruiterDetailService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.setupAccessibility();
    this.loadUserData();
    this.updateMotivation();
    this.intervalId = setInterval(() => {
      this.updateMotivation();
    }, 3600000);
  }

  private calculateJobCounts() {
    // Calculate active and inactive job counts
    this.activeJobsCount = this.jobPostings.filter(job => job.status === 'Active').length;
    this.inactiveJobsCount = this.jobPostings.filter(job => job.status === 'Inactive').length;

    // Update stats data
    this.statsData[0].value = this.activeJobsCount;
    this.statsData[1].value = this.totalApplications;
    this.statsData[2].value = this.weeklyInterviews;

    // Calculate hire rate if you have the necessary data
    const hireRate = this.calculateHireRate();
    this.statsData[3].value = `${hireRate}%`;
  }

  private calculateHireRate(): number {
    // If you have the hired count and total applications
    const hiredCount = this.pipelineStages.find(stage => stage.name === 'Hired')?.count || 0;
    if (this.totalApplications > 0) {
      return Math.round((hiredCount / this.totalApplications) * 100);
    }
    return 0;
  }

  private async loadUserData() {
    try {
      this.user = await this.userService.findLoggedUser();
      await this.loadProfilePic(this.user._id);
      await this.getJobPostingOfCurrentUser();
      await this.fetchApplicationCounts();
      await this.fetchAllInterviews(this.user._id);
      
      const recruiter = await this.recruiterService.findRecruiterDetailsByUserId();
      // Add any additional recruiter-specific data handling here
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  loadProfilePic(userId: string): void {
    console.log("@@@@@@@@@",userId)
    this.userService.getProfilePic(userId).subscribe(
      (data: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.profilePicUrl = reader.result as string;
        };
        reader.readAsDataURL(data);
      },
      error => console.error('Error fetching profile picture:', error)
    );
  }

  async getJobPostingOfCurrentUser() {
    this.isLoading = true;
    try {
      const jobPostings = await this.jobPostService.getAllJobPostingForUser();
      this.jobPostings = jobPostings.reverse();
      this.jobapplicants = jobPostings[0]?.applicationDetails?.totalApplications || 0;
      this.jobPostings.forEach((jobPost: Job) => {
        if (!jobPost.status) {
          jobPost.status = 'Active';
        }
        if (jobPost.datePosted) {
          jobPost.date = new Date(jobPost.datePosted).toDateString();
        } else {
          jobPost.date = '';
        }
      });

      this.calculateJobCounts();
      this.updatePipelineStages();
    } catch (error) {
      console.error('Error fetching job postings:', error);
    } finally {
      this.isLoading = false;
    }
  }
  private initializeApplicationTrendsChart() {
    const ctx = document.getElementById('applicationTrends') as HTMLCanvasElement;
    if (!ctx) return;
  
    this.applicationTrendsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Empty initially, will be updated dynamically
        datasets: [{
          label: 'Applications',
          data: [],
          borderColor: '#6366F1',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  
    // Fetch and update data after chart is initialized
    this.fetchApplicationCounts();
  }
  
  fetchApplicationCounts() {
    this.jobPostService.getJobApplicationCounts().subscribe(
      (response: any) => {
        this.jobApplicationStats = response;
        this.totalApplications = response.totalApplications;
        
        // Prepare new data for the chart
        const labels = response.jobWiseCount.map((stat: { jobTitle: any; }) => stat.jobTitle); // Assuming jobTitle is available
        const data = response.jobWiseCount.map((stat: { applicationCount: any; }) => stat.applicationCount);
  
        this.applicationCounts = {};
        response.jobWiseCount.forEach((stat: { jobId: string | number; applicationCount: number; }) => {
          this.applicationCounts[stat.jobId] = stat.applicationCount;
        });
  
        // Update chart data
        this.updateChart(labels, data);
      },
      error => console.error('Error fetching application counts:', error)
    );
  }
  
  private updateChart(labels: string[], data: number[]) {
    if (this.applicationTrendsChart) {
      this.applicationTrendsChart.data.labels = labels;
      this.applicationTrendsChart.data.datasets[0].data = data;
      this.applicationTrendsChart.update();
    }
  }
  
  
  

  private updatePipelineStages() {
    // Update pipeline stages based on application stats
    if (this.totalApplications > 0) {
      this.pipelineStages[0].count = this.activeJobsCount;
      this.pipelineStages[0].percentage = 100;
      
      // Calculate other stages based on your business logic
      // This is an example calculation
      this.pipelineStages.forEach((stage, index) => {
        if (index > 0) {
          stage.count = Math.floor(this.activeJobsCount * (1 - (index * 0.2)));
          stage.percentage = Math.round((stage.count / this.totalApplications) * 100);
        }
      });
    }
  }

  private updateMotivation(): void {
    const motivations = [
      "Let's find your next star employee! 🌟",
      "Building dream teams, one hire at a time ✨",
      "Ready to transform someone's career today? 🚀",
      "Your next great hire is just a click away! 🎯",
      "Making meaningful connections happen 🤝"
    ];
    this.motivation = motivations[Math.floor(Math.random() * motivations.length)];
  }

  setupAccessibility() {
    document.title = 'Recruiter Dashboard - ATS System';
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return '👋 Early Bird';
    if (hour < 12) return '👋Good Morning';
    if (hour < 17) return '👋 Good Afternoon';
    if (hour < 21) return '👋Good Evening';
    return '👋 Night Owl';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  getDailyMotivation(): string {
    const motivations = [
      "Let's find your next star employee! 🌟",
      "Building dream teams, one hire at a time ✨",
      "Ready to transform someone's career today? 🚀",
      "Your next great hire is just a click away! 🎯",
      "Making meaningful connections happen 🤝"
    ];
    return motivations[Math.floor(Math.random() * motivations.length)];
  }


  

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    const colors: { [key: string]: string } = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || colors['medium'];
  }

  getIconPath(icon: 'briefcase' | 'users' | 'calendar' | 'trending-up'): string {
    const paths: { [key: string]: string } = {
      briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    };
    return paths[icon] || '';
  }

  private initializeCharts() {
    this.initializeApplicationTrendsChart();
    this.initializeApplicationSourcesChart();
  }


  private initializeApplicationSourcesChart() {
    const ctx = document.getElementById('applicationSources') as HTMLCanvasElement;
    if (!ctx) return;

    this.applicationSourcesChart = new Chart(ctx, {
      type: 'doughnut' as keyof ChartTypeRegistry,
      data: {
        labels: ['LinkedIn', 'Company Website', 'Job Boards', 'Referrals'],
        datasets: [{
          data: [35, 25, 20, 20],
          backgroundColor: [
            '#6366F1',
            '#8B5CF6',
            '#EC4899',
            '#14B8A6'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        elements: {
          arc: {
            borderWidth: 0, // Optional: Set border width if needed
          }
        },
        // cutout: '70%' // Ensure this is correctly placed for Chart.js version 3.x or later
      }
    });
  }

  updateChartPeriod(period: string) {
    this.selectedPeriod = period;
    // Update chart data based on selected period
    this.refreshChartData();
  }

  private refreshChartData() {
    if (!this.applicationTrendsChart) return;

    // Example of updating chart data based on period
    const data = this.getChartDataForPeriod(this.selectedPeriod as 'week' | 'month' | 'year');
    this.applicationTrendsChart.data.labels = data.labels;
    this.applicationTrendsChart.data.datasets[0].data = data.values;
    this.applicationTrendsChart.update();
  }

  private getChartDataForPeriod(period: 'week' | 'month' | 'year') {
    const mockData: {
      week: { labels: string[]; values: number[]; };
      month: { labels: string[]; values: number[]; };
      year: { labels: string[]; values: number[]; };
    } = {
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [12, 19, 15, 17, 14, 8, 6]
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [45, 52, 49, 60]
      },
      year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [65, 78, 90, 85, 98, 110, 105, 115, 108, 118, 125, 130]
      }
    };
    return mockData[period] || mockData.month;
  }

  viewJobDetails(job: Job) {
    this.router.navigate(['/job/manage/', job._id]);
  }

  viewAllJobs() {
    this.router.navigate(['/company/job-postings']);
  }

  openNewJobModal() {
    // Implement modal opening logic
    console.log('Opening new job modal');
  }

  toggleNotifications() {
    // Implement notifications panel toggle
    console.log('Toggling notifications panel');
  }

  refreshDashboard() {
    // Implement dashboard refresh logic
    console.log('Refreshing dashboard data');
  }

 

  ngOnDestroy() {
    // Cleanup charts
    if (this.applicationTrendsChart) {
      this.applicationTrendsChart.destroy();
    }
    if (this.applicationSourcesChart) {
      this.applicationSourcesChart.destroy();
    }

    if (this.intervalId) {
      clearInterval(this.intervalId); // Clean up interval when component is destroyed
    }
  }





  showInterviews(day: CalendarDay): boolean {
    return (this.selectedDay === day.day || this.hoveredDay === day.day) && 
           day.interviews !== undefined && 
           day.interviews.length > 0;
  }

  onDayHover(day: number | null) {
    this.hoveredDay = day;
  }

  onDayClick(day: number) {
    this.selectedDay = this.selectedDay === day ? null : day;
  }
  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    this.firstDayIndex = firstDay.getDay();
    
    this.calendarDays = [];

    // Add empty days for the start of the month
    for (let i = 0; i < this.firstDayIndex; i++) {
      this.calendarDays.push({
        day: 0,
        date: '',
        hasInterview: false,
        isToday: false,
        interviews: []
      });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      const dayInterviews = this.upcomingInterviews.filter(interview => 
        interview.startDateTime.split('T')[0] === dateString
      );

      this.calendarDays.push({
        day,
        date: dateString,
        hasInterview: dayInterviews.length > 0,
        isToday: this.isToday(date),
        interviews: dayInterviews
      });
    }

    // Update interviews property for the current month
    this.interviews = this.upcomingInterviews.filter(interview => {
      const interviewDate = new Date(interview.startDateTime);
      return interviewDate.getMonth() === month && 
             interviewDate.getFullYear() === year;
    });
  }

  fetchAllInterviews(userId: string) {
    this.isLoadingInterviews = true;
    this.http.get<{ interviews: Interview[]; totalInterviewCount: number }>(
      `http://localhost:5500/api/user/${userId}/scheduled-interviews`
    ).subscribe({
      next: (response) => {
        this.upcomingInterviews = response.interviews.map(interview => ({
          ...interview,
          time: new Date(interview.startDateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }));
        this.totalInterviews = response.totalInterviewCount;
        this.generateCalendar();
        this.calculateWeeklyInterviews();
        this.isLoadingInterviews = false;
      },
      error: (error) => {
        console.error('Error fetching interviews:', error);
        this.isLoadingInterviews = false;
      }
    });
  }

  private calculateWeeklyInterviews() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.weeklyInterviews = this.upcomingInterviews.filter(interview => {
      const interviewDate = new Date(interview.startDateTime);
      return interviewDate >= startOfWeek && interviewDate <= endOfWeek;
    }).length;

    this.statsData[2].value = this.weeklyInterviews;
  }

  previousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(), 
      this.currentDate.getMonth() - 1
    );
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(), 
      this.currentDate.getMonth() + 1
    );
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }

  getMonthYear(): string {
    return this.currentDate.toLocaleDateString(undefined, { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  // // Add loading state getters
  get isinterviewLoading(): boolean {
    return this.isLoadingInterviews;
  }

  get todaysInterviews(): Interview[] {
    const today = new Date().toISOString().split('T')[0];
    return this.upcomingInterviews.filter(interview => 
      interview.startDateTime.split('T')[0] === today
    );
  }
}