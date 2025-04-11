import { RouterModule, Routes } from '@angular/router';
import { JobBoardComponent } from './components/job-board/job-board.component';
import { JobListComponent } from './components/job-list/job-list.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileRecruiterComponent } from './components/profile-recruiter/profile-recruiter.component';
import { ProfileSeekerComponent } from './components/profile-seeker/profile-seeker.component';
import { ViewJobComponent } from './components/view-job/view-job.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { PostJobComponent } from './components/post-job/post-job.component';
import { JobSeekerDashboardComponent } from './components/job-seeker-dashboard/job-seeker-dashboard.component';
import { RecruiterDashboardComponent } from './components/recruiter-dashboard/recruiter-dashboard.component';
import { UserProfileShareComponent } from './components/user-profile-share/user-profile-share.component';
import { AboutComponent } from './components/about/about.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { AskComponent } from './components/ask/ask.component';
import { PVCListComponent } from './components/pvc-list/pvc-list.component';
import { AppliedJobsListComponent } from './components/applied-jobs-list/applied-jobs-list.component';
import { SitemapComponent } from './components/sitemap/sitemap.component';
import { EmployerRegisterComponent } from './components/employer-register/employer-register.component';
import { EditJobPostingComponent } from './components/edit-job-posting/edit-job-posting.component';
import { JobApplicationComponent } from './components/job-application/job-application.component';
import { MatchedProfileViewComponent } from './components/matched-profile-view/matched-profile-view.component';
import { CompanayJobListComponent } from './components/companay-job-list/companay-job-list.component';
import { CreditPointsComponent } from './components/credit-points/credit-points.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { CompanyPublicProfileComponent } from './components/company-public-profile/company-public-profile.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { AdminBlogComponent } from './components/admin-blog/admin-blog.component';
import { BlogComponent } from './components/blog/blog.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { JobApplicationDetailsComponent } from './components/job-application-details/job-application-details.component';
import { SignupComponent } from './components/signup/signup.component';
import { ManageJobComponent } from './components/manage-job/manage-job.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // { path: '', redirectTo: '/chats', pathMatch: 'full' },
  { path: 'password-reset', component: PasswordResetComponent },
  // Optionally, add a route for handling the reset token
  { path: 'reset-password/:token', component: PasswordResetComponent },
  {
    path: 'home',
    component: JobBoardComponent,
    data: {
      title: 'Home - hiyrnow',
      description:
        'Welcome to hiyrnow. Find the latest job openings and employment opportunities.',
      keywords: 'job portal, job search, career opportunities',
    },
  },
  {
    path: 'blog/:id',
    component: BlogDetailComponent,
    data: {
      title: 'Blog Detail - hiyrnow',
      description:
        'Read our latest blog posts about recruitment and career advice.',
      keywords: 'blog, career advice, recruitment tips',
    },
  },

  {
    path: 'blogs',
    component: BlogComponent,
    data: {
      title: 'HiYrNow Blog - Career Tips and Job Portal Insights',
      description:
        'Read HiYrNow\'s latest blog posts about recruitment and career advice.',
      keywords: 'blog, career advice, recruitment tips, hiyrnow',
    },
  },
  {
    path: 'admin/blog',
    component: AdminBlogComponent,
    data: {
      title: 'Blog Management - hiyrnow',
      description: 'Manage blog posts',
      keywords: 'admin, blog management',
    },
  },

  // {
  //   path: 'Employer-register',
  //   component: EmployerRegisterComponent,
  //   data: {
  //     title: 'Employer-register',
  //     description:
  //       'Welcome to hiyrnow. Find the latest job openings and employment opportunities.',
  //     keywords: 'job portal, job search, career opportunities',
  //   },
  // },
  {
    path: 'Matched-Profile/:userId/:jobId',
    component: MatchedProfileViewComponent,
    data: {
      title: 'Employer-register',
      description:
        'Welcome to hiyrnow. Find the latest job openings and employment opportunities.',
      keywords: 'job portal, job search, career opportunities',
    },
  },
  {
    path: 'Post-job',
    component: PostJobComponent,
    data: {
      title: 'Post-job',
      description:
        'Welcome to hiyrnow. Find the latest job openings and employment opportunities.',
      keywords: 'job portal, job search, career opportunities',
    },
  },
  { path: 'sitemap', component: SitemapComponent },
  {
    path: 'ApplicationDetails/:applicationId',
    component: JobApplicationDetailsComponent
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {
      title: 'About Us - hiyrnow',
      description:
        'Learn more about hiyrnow and our mission to connect job seekers with employers.',
      keywords: 'about, hiyrnow, job portal information',
    },
  },
  {
    path: 'help',
    component: AskComponent,
    data: {
      title: 'Help & Support - hiyrnow',
      description: 'Get help and support for using hiyrnow.',
      keywords: 'help, support, hiyrnow assistance',
    },
  },
  {
    path: 'pricing',
    component: PricingComponent,
    data: {
      title: 'Pricing - hiyrnow',
      description:
        'Check out our pricing plans for job postings and other services.',
      keywords: 'pricing, job postings, hiyrnow services',
    },
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: {
      title: 'Admin Dashboard - hiyrnow',
      description: 'Admin dashboard for managing hiyrnow.',
      keywords: 'admin, dashboard, hiyrnow management',
    },
  },
  {
    path: 'PVC-candidates',
    component: PVCListComponent,
    data: {
      title: 'PVC Candidates - hiyrnow',
      description: 'View the list of PVC candidates on hiyrnow.',
      keywords: 'PVC candidates, job candidates, hiyrnow',
    },
  },
  {
    path: 'register',
    component: SignupComponent,
    data: {
      title: 'Register - hiyrnow',
      description: 'Register for an account on hiyrnow.',
      keywords: 'register, sign up, hiyrnow account',
    },
  },
  {
    path: 'edit-job/:id',
    component: EditJobPostingComponent,
  },
  {
    path: 'Company/:userId',
    component: CompanyPublicProfileComponent,
  },
  {
    path: 'job/manage/:id',
    component: ManageJobComponent,
    data: {
      title: 'Job Details - hiyrnow',
      description: 'View job details on hiyrnow.',
      keywords: 'job details, job listing, hiyrnow',
    },
  },
  {
    path: 'job/:id',
    component: ViewJobComponent,
    data: {
      title: 'Job Details - hiyrnow',
      description: 'View job details on hiyrnow.',
      keywords: 'job details, job listing, hiyrnow',
    },
  },
  { path: 'credits', component: CreditPointsComponent },

  { path: 'settings', component: SettingsComponent },
  { path: 'Alluser', component: UsersListComponent },
  {
    path: 'company/job-postings',
    component: CompanayJobListComponent,
    data: {
      title: 'Job Details - hiyrnow',
      description: 'View job details on hiyrnow.',
      keywords: 'job details, job listing, hiyrnow',
    },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login - hiyrnow',
      description: 'Log in to your hiyrnow account.',
      keywords: 'login, sign in, hiyrnow account',
    },
  },
  {
    path: 'company/profile',
    component: ProfileRecruiterComponent,
    data: {
      title: 'company Profile - hiyrnow',
      description: 'View and manage your company profile on hiyrnow.',
      keywords: 'company profile, manage profile, hiyrnow',
    },
  },
  {
    path: 'profile/:userId',
    component: ProfileSeekerComponent,
    data: {
      title: 'Job Seeker Profile - hiyrnow',
      description: 'View and manage your job seeker profile on hiyrnow.',
      keywords: 'job seeker profile, manage profile, hiyrnow',
    },
  },
  {
    path: 'company/dashboard',
    component: RecruiterDashboardComponent,
    data: {
      title: 'Recruiter Dashboard - hiyrnow',
      description:
        'Manage your job postings and applications from the recruiter dashboard.',
      keywords: 'recruiter dashboard, manage postings, hiyrnow',
    },
  },
  {
    path: 'dashboard-seeker',
    component: JobSeekerDashboardComponent,
    data: {
      title: 'Job Seeker Dashboard - hiyrnow',
      description:
        'Manage your job applications and profile from the job seeker dashboard.',
      keywords: 'job seeker dashboard, manage applications, hiyrnow',
    },
  },
  {
    path: 'job-list',
    component: JobListComponent,
    data: {
      title: 'Job List - hiyrnow',
      description: 'Browse jobs based on location and keyword on hiyrnow.',
      keywords: 'job list, browse jobs, hiyrnow',
    },
  },

  {
    path: 'job-list/:location/:keyword/view-job/:jobId',
    component: ViewJobComponent,
    data: {
      title: 'Job Details - hiyrnow',
      description: 'View job details on hiyrnow.',
      keywords: 'job details, job listing, hiyrnow',
    },
  },
  {
    path: 'dashboard-seeker/view-job/:jobId',
    component: ViewJobComponent,
    data: {
      title: 'Job Details - hiyrnow',
      description: 'View job details on hiyrnow.',
      keywords: 'job details, job listing, hiyrnow',
    },
  },
  {
    path: 'company/dashboard/view-job/:jobId',
    component: ViewJobComponent,
    data: {
      title: 'Job Details - hiyrnow',
      description: 'View job details on hiyrnow.',
      keywords: 'job details, job listing, hiyrnow',
    },
  },
  {
    path: 'new-job',
    component: PostJobComponent,
    data: {
      title: 'Post a Job - hiyrnow',
      description: 'Post a new job on hiyrnow.',
      keywords: 'post job, new job, hiyrnow',
    },
  },
  {
    path: 'applied-jobs',
    component: AppliedJobsListComponent,
    data: {
      title: 'Applied Jobs - hiyrnow',
      description: 'View the jobs you have applied for on hiyrnow.',
      keywords: 'applied jobs, job applications, hiyrnow',
    },
  },
  {
    path: 'profile-seeker/:userId',
    component: UserProfileShareComponent,
    data: {
      title: 'Job Seeker Profile - hiyrnow',
      description: 'View the shared job seeker profile on hiyrnow.',
      keywords: 'job seeker profile, shared profile, hiyrnow',
    },
  },
  {
    path: 'profile-seeker/:jobId/:userId',
    component: UserProfileShareComponent,
    data: {
      title: 'Job Seeker Profile - hiyrnow',
      description: 'View the shared job seeker profile on hiyrnow.',
      keywords: 'job seeker profile, shared profile, hiyrnow',
    },
  },
  {
    path: 'jobApplication/:jobId/:userId',
    component: JobApplicationComponent,
    data: {
      title: 'jobApplication - hiyrnow',
      description: 'View the shared jobApplication on hiyrnow.',
      keywords: 'job seeker profile, shared profile, hiyrnow',
    },
  },
  {
    path: '**',
    component: JobBoardComponent,
    data: {
      title: '404 - Page Not Found',
      description: 'The page you are looking for does not exist on hiyrnow.',
      keywords: '404, page not found, hiyrnow',
    },
  },
  // { path: 'sitemap.xml', component: SitemapComponent },
];

export const routing = RouterModule.forRoot(appRoutes, {
  initialNavigation: 'enabledBlocking',
  scrollPositionRestoration: 'enabled'
});
