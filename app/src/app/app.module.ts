import { BrowserModule, Meta, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { NgxFileDropModule } from 'ngx-file-drop';
import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileRecruiterComponent } from './components/profile-recruiter/profile-recruiter.component';
import { ProfileSeekerComponent } from './components/profile-seeker/profile-seeker.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { JobBoardComponent } from './components/job-board/job-board.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchFilterPipe } from './components/job-board/job-board.component';
import { ViewJobComponent } from './components/view-job/view-job.component';
import { JobListingService } from './services/job-listing.service';
import { UserService } from './services/user.service';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { PostJobComponent } from './components/post-job/post-job.component';
import { SaveJobService } from './services/save-job.service';
import { ExperienceListComponent } from './components/experience-list/experience-list.component';
import { AwardListComponent } from './components/award-list/award-list.component';
import { SkillListComponent } from './components/skill-list/skill-list.component';
import { EducationListComponent } from './components/education-list/education-list.component';
import { ExtraCurricularListComponent } from './components/extra-curricular-list/extra-curricular-list.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { CertificateListComponent } from './components/certificate-list/certificate-list.component';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { UserSidebarComponent } from './components/user-sidebar/user-sidebar.component';
import { JobSeekerDashboardComponent } from './components/job-seeker-dashboard/job-seeker-dashboard.component';
import { RecruiterDashboardComponent } from './components/recruiter-dashboard/recruiter-dashboard.component';
import { ResumeUploadComponent } from './components/resume-upload/resume-upload/resume-upload.component';
import { ResumeViewComponent } from './components/resume-view/resume-view.component';
import { MatDialogModule } from '@angular/material/dialog';
import { JobListComponent } from './components/job-list/job-list.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
// import { FileUploadModule } from 'ng2-file-upload';
import { MatTableModule } from '@angular/material/table';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ProfilePicComponent } from './components/profile-pic/profile-pic.component';
import { EditBioModalComponent } from './components/edit-bio-modal/edit-bio-modal.component';
import { UserProfileShareComponent } from './components/user-profile-share/user-profile-share.component';
import { AboutComponent } from './components/about/about.component';
import { AskComponent } from './components/ask/ask.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { PVCListComponent } from './components/pvc-list/pvc-list.component';
import { CommonModule } from '@angular/common';
import { JobPostingService } from './services/job-posting.service';
import { RecruiterDetailService } from './services/recruiter-detail.service';
import { AppliedJobsListComponent } from './components/applied-jobs-list/applied-jobs-list.component';
import { SitemapComponent } from './components/sitemap/sitemap.component';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
import { EmployerRegisterComponent } from './components/employer-register/employer-register.component';
import { EditJobPostingComponent } from './components/edit-job-posting/edit-job-posting.component';
// Import Angular Material modules

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatChipsModule } from '@angular/material/chips';
import { JobApplicationComponent } from './components/job-application/job-application.component';
import { ScheduleInterviewModalComponent } from './components/schedule-interview-modal/schedule-interview-modal.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { JobApplicationModalComponent } from './components/job-application-modal/job-application-modal.component';
import { EditProfileModalComponent } from './components/edit-profile-modal/edit-profile-modal.component';
import { MatchedProfileViewComponent } from './components/matched-profile-view/matched-profile-view.component';
import { EmailService } from './services/email-service.service';
import { AssignmentModalComponent } from './components/assignment-modal/assignment-modal.component';
import { CompanayJobListComponent } from './components/companay-job-list/companay-job-list.component';
import { SidebarNavItemComponent } from './components/sidebar-nav-item/sidebar-nav-item.component';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreditPointsComponent } from './components/credit-points/credit-points.component';
import { PurchasePointsComponent } from './components/purchase-points/purchase-points.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AdminCreditManagementComponent } from './components/admin-credit-management/admin-credit-management.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { CompanyPublicProfileComponent } from './components/company-public-profile/company-public-profile.component';
import { LayoutModule } from '@angular/cdk/layout';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { BlogComponent } from './components/blog/blog.component';
import { AdminBlogComponent } from './components/admin-blog/admin-blog.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { JobApplicationDetailsComponent } from './components/job-application-details/job-application-details.component';
import { ShareModalComponent } from './components/share-modal/share-modal.component';
import { SeoService } from './services/seo.service';
import { SignupComponent } from './components/signup/signup.component';
import { CommingsoonComponent } from './components/commingsoon/commingsoon.component';
import { ContactDialogComponent } from './components/contact-dialog/contact-dialog.component';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { ManageJobComponent } from './components/manage-job/manage-job.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CompanyProfileComponent } from './components/company-profile/company-profile.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileRecruiterComponent,
    ProfileSeekerComponent,
    NavBarComponent,
    JobBoardComponent,
    FooterComponent,
    SearchFilterPipe,
    ViewJobComponent,
    JobListComponent,
    RegisterComponent,
    AdminComponent,
    PostJobComponent,
    ExperienceListComponent,
    AwardListComponent,
    SkillListComponent,
    EducationListComponent,
    ExtraCurricularListComponent,
    ProjectListComponent,
    CertificateListComponent,
    PersonalInfoComponent,
    UserSidebarComponent,
    JobSeekerDashboardComponent,
    RecruiterDashboardComponent,
    ResumeUploadComponent,
    ResumeViewComponent,
    ProfilePicComponent,
    EditBioModalComponent,
    UserProfileShareComponent,
    AboutComponent,
    AskComponent,
    PricingComponent,
    PVCListComponent,
    AppliedJobsListComponent,
    SitemapComponent,
    SafeHtmlPipe,
    EmployerRegisterComponent,
    EditJobPostingComponent,
    JobApplicationComponent,
    ScheduleInterviewModalComponent,
    JobApplicationModalComponent,
    EditProfileModalComponent,
    MatchedProfileViewComponent,
    AssignmentModalComponent,
    CompanayJobListComponent,
    SidebarNavItemComponent,
    CreditPointsComponent,
    PurchasePointsComponent,
    SettingsComponent,
    AdminCreditManagementComponent,
    UsersListComponent,
    CompanyPublicProfileComponent,
    PasswordResetComponent,
    AdminBlogComponent,
    BlogComponent,
    BlogDetailComponent,
    JobApplicationDetailsComponent,
    ShareModalComponent ,
    SignupComponent,
    CommingsoonComponent,
    ContactDialogComponent,
    ProfileListComponent,
    ManageJobComponent,
    CompanyProfileComponent,
    UserProfileComponent
  ],
  imports: [
   
    BrowserModule,
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    routing,
    // FileUploadModule,
    FontAwesomeModule,
    MatIconModule,
    MatInputModule,
    LayoutModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatIconModule,
    MatListModule,
    NgxFileDropModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    HttpClientModule,
    MatDialogModule,
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
    }),
    QuillModule.forRoot()
  ],
  providers: [
    JobListingService,
    UserService,
    SaveJobService,
    JobPostingService,
    RecruiterDetailService,
    ToastrService,
    EmailService,
    Meta,
    SeoService,
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
