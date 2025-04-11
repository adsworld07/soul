import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { JobPostingModelClient } from '../../models/job-posting.model.client';
import { JobPostingService } from '../../services/job-posting.service';
import { FilterService } from '../../services/filter.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  private searchSubject = new Subject<void>();
  activeTab: 'all-jobs' | 'recommended' = 'all-jobs';
  screenWidth: number = window.innerWidth;
  
  searchParams = {
    keyword: '',
    location: '',
    sortBy: 'newest' as 'newest' | 'relevant'
  };

  filterOptions = {
    jobTypes: ['Full Time', 'Part Time', 'Contract', 'Internship'],
    experienceLevels: ['Entry Level', '1-3 years', '3-5 years', '5+ years'],
    salaryRanges: ['0-30k', '30k-60k', '60k-90k', '90k+'],
    remoteOptions: ['Remote', 'Hybrid', 'On-site']
  };

  selectedFilters = {
    jobTypes: [] as string[],
    experienceLevels: [] as string[],
    salaryRanges: [] as string[],
    remoteOptions: [] as string[]
  };

  state = {
    jobs: [] as JobPostingModelClient[],
    filteredJobs: [] as JobPostingModelClient[],
    recommendedJobs: [] as JobPostingModelClient[],
    isFiltered: false,
    isMobileSidebarOpen: false,
    isLoading: false,
    error: null as string | null,
    totalJobs: 0,
    currentPage: 1,
    jobsPerPage: 10
  };

  constructor(
    private jobPostService: JobPostingService,
    private filterService: FilterService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.setupSearchDebounce();
  }

  // Add Math to component for template usage
  get Math() {
    return Math;
  }

  setActiveTab(tab: 'all-jobs' | 'recommended') {
    this.activeTab = tab;
    if (tab === 'recommended') {
      this.state.filteredJobs = this.state.recommendedJobs;
    } else {
      this.filterJobs();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filterJobs();
    });
  }

  ngOnInit() {
    this.initializeComponent();
  }

  private async initializeComponent() {
    try {
      await Promise.all([
        this.fetchJobs(),
        this.fetchRecommendedJobs()
      ]);
      this.handleQueryParameters();
    } catch (error) {
      this.handleError(error);
    }
  }


  // Handle initial query parameters
  private handleQueryParameters() {
    this.route.queryParamMap.subscribe(params => {
      this.searchParams.location = params.get('location') || '';
      this.searchParams.keyword = params.get('keyword') || '';

      if (this.searchParams.location || this.searchParams.keyword) {
        this.filterJobs();
      }
    });
  }

  private async fetchJobs() {
    try {
      this.state.isLoading = true;
      const allJobs = await this.jobPostService.getAllJobPostings();
      this.state.jobs = this.filterActiveJobs(allJobs);
      this.state.filteredJobs = [...this.state.jobs];
      this.state.totalJobs = this.state.jobs.length;
    } finally {
      this.state.isLoading = false;
    }
  }

  private filterActiveJobs(jobs: JobPostingModelClient[]): JobPostingModelClient[] {
    return jobs.filter(job => job.status === 'Active');
  }

  private async fetchRecommendedJobs() {
    const user = await this.userService.findLoggedUser();
    if (user?._id) {
      const response = await this.jobPostService.getMatchedJobsByUserId(user._id).toPromise();
      this.state.recommendedJobs = response?.matchedJobs || [];
    }
  }


  filterJobs() {
    this.state.isFiltered = true;
    this.state.filteredJobs = this.state.jobs.filter(job => 
      this.matchesAllCriteria(job)
    );
    
    this.sortJobs();
    this.updatePagination();
  }

  private matchesAllCriteria(job: JobPostingModelClient): boolean {
    return (
      this.matchesKeyword(job) &&
      this.matchesLocation(job) &&
      this.matchesJobType(job) &&
      this.matchesExperience(job) &&
      this.matchesSalaryRange(job) &&
      this.matchesRemoteOption(job)
    );
  }

  // Matching methods implementation...
  private matchesKeyword(job: JobPostingModelClient): boolean {
    if (!this.searchParams.keyword) return true;
    const searchTerm = this.searchParams.keyword.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchTerm) ||
      job.company?.toLowerCase().includes(searchTerm) ||
      job.skillsRequired?.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  }

  private matchesLocation(job: JobPostingModelClient): boolean {
    return !this.searchParams.location || 
           job.location?.toLowerCase().includes(this.searchParams.location.toLowerCase());
  }

  private matchesJobType(job: JobPostingModelClient): boolean {
    return this.selectedFilters.jobTypes.length === 0 || 
           this.selectedFilters.jobTypes.includes(job.type);
  }

  private matchesExperience(job: JobPostingModelClient): boolean {
    if (this.selectedFilters.experienceLevels.length === 0) return true;
    return this.selectedFilters.experienceLevels.some(exp => {
      const years = parseInt(exp.match(/\d+/)?.[0] || '0', 10);
      return job.minExp >= years;
    });
  }

  private matchesSalaryRange(job: JobPostingModelClient): boolean {
    if (this.selectedFilters.salaryRanges.length === 0) return true;
    // Implementation depends on your salary data structure
    return true;
  }

  private matchesRemoteOption(job: JobPostingModelClient): boolean {
    if (this.selectedFilters.remoteOptions.length === 0) return true;
    return this.selectedFilters.remoteOptions.includes(job.workType || '');
  }

  private sortJobs() {
    this.state.filteredJobs.sort((a, b) => {
      if (this.searchParams.sortBy === 'newest') {
        return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      }
      // Add other sorting implementations as needed
      return 0;
    });
  }

  private updatePagination() {
    const startIndex = (this.state.currentPage - 1) * this.state.jobsPerPage;
    const endIndex = startIndex + this.state.jobsPerPage;
    this.state.filteredJobs = this.state.filteredJobs.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.state.currentPage = page;
    this.filterJobs();
  }

  
  resetFilters() {
    this.searchParams = { keyword: '', location: '', sortBy: 'newest' };
    this.selectedFilters = {
      jobTypes: [],
      experienceLevels: [],
      salaryRanges: [],
      remoteOptions: []
    };
    this.state.isFiltered = false;
    this.filterJobs();
  }

  viewJobDetails(job: JobPostingModelClient) {
    this.router.navigate(['/job', job._id]);
  }
  handleFilterSelection(group: keyof typeof this.selectedFilters, value: string) {
    const filters = this.selectedFilters[group];
    const index = filters.indexOf(value);

    if (index > -1) {
      filters.splice(index, 1);
    } else {
      filters.push(value);
    }

    this.filterJobs();
  }

  isMobileView(): boolean {
    return this.screenWidth < 768;
  }

  toggleMobileSidebar() {
    this.state.isMobileSidebarOpen = !this.state.isMobileSidebarOpen;
  }

  onSearch() {
    this.searchSubject.next();
  }

  private handleError(error: any) {
    console.error('Error:', error);
    this.state.error = 'An error occurred while fetching jobs. Please try again later.';
  }
}