import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RecruiterDetailService } from '../../services/recruiter-detail.service';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { Router } from '@angular/router';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string; // Full-time, Part-time, Remote, etc.
  posted: string;
}

interface Review {
  id: number;
  rating: number;
  title: string;
  position: string;
  comment: string;
  pros: string;
  cons: string;
  date: string;
}

interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  caption: string;
}

interface CompanyInfo {
  name: string;
  logo: string;
  banner: string;
  tagline: string;
  website: string;
  industry: string;
  founded: string;
  size: string;
  location: string;
  description: string;
  mission: string;
  vision: string;
  overallRating: number;
  totalReviews: number;
}

@Component({
  selector: 'app-profile-recruiter',
  templateUrl: './profile-recruiter.component.html',
  styleUrls: ['./profile-recruiter.component.css']
})
export class ProfileRecruiterComponent implements OnInit {
  user: any;
  isProfilePicModalOpen = false;
  recruiter: any;
  isCurrentUser: boolean = false;
  updateId = '';
  updateCompanyId = '';
  username = '';
  password = '';
  firstName = '';
  lastName = '';
  title = '';
  company: CompanyInfo = {
    name: '',
    logo: 'assets/defaultLogo.png',
    banner: 'assets/banner.jpg',
    tagline: 'Innovating for a better tomorrow',
    website: '',
    industry: '',
    founded: '',
    size: '',
    location: '',
    description: '',
    mission: '',
    vision: '',
    overallRating: 4.8,
    totalReviews: 75
  };
  companyName = '';
  companyWebsite = '';
  industry = '';
  location = '';
  aboutCompany = '';
  companyMission = '';
  coreValues = '';
  employeeBenefits = '';
  numberOfEmployees: number | undefined;
  yearEstablished: number | undefined;
  email = '';
  requestStatus = '';
  phone = '';
  facebook = '';
  linkedin = '';
  github = '';
  twitter = '';
  socialContact: any[] = [];
  editMode = false;
  profilePicUrl: string = 'assets/defaultLogo.png';
  profilePicExist = false;
  activeTab = 'about';
  tabs = [
    { id: 'about', name: 'About' },
    { id: 'careers', name: 'Careers' },
    { id: 'contact', name: 'Contact' },
    { id: 'people', name: 'People' },
    { id: 'products', name: 'Products & Services' }
  ];

  // New fields
  productsServices: string[] = [];
  teamMembers: any[] = [];
  userId: any;
  userProfileLink!: string;
  // UI State Variables
  isDarkMode = false;
  selectedJobFilter = 'all';
  currentGalleryIndex = 0;

  // Benefits, Jobs, Reviews and Gallery
  benefits: any[] = [
    { title: 'Remote-First Culture', description: 'Work from anywhere in the world with flexible hours', icon: 'globe' },
    { title: 'Unlimited PTO', description: 'Take the time you need to recharge and bring your best self to work', icon: 'calendar' },
    { title: 'Health & Wellness', description: 'Comprehensive health coverage and wellness stipend', icon: 'heart' },
    { title: 'Learning Budget', description: '$2,000 annual budget for courses, books, and conferences', icon: 'book' },
    { title: '401k Matching', description: 'We match 100% of contributions up to 4% of your salary', icon: 'trending-up' },
    { title: 'Equity Packages', description: 'Be an owner in the company youre helping build', icon: 'award' }
  ];
 
  jobListings: Job[] = [
    { id: 1, title: 'Senior Frontend Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', posted: '2 days ago' },
    { id: 2, title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', type: 'Full-time', posted: '1 week ago' },
    { id: 3, title: 'UX/UI Designer', department: 'Design', location: 'Remote', type: 'Full-time', posted: '3 days ago' },
    { id: 4, title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', posted: '5 days ago' },
    { id: 5, title: 'Data Scientist', department: 'Data', location: 'New York, NY', type: 'Full-time', posted: '1 day ago' },
    { id: 6, title: 'Content Writer', department: 'Marketing', location: 'Remote', type: 'Part-time', posted: '3 days ago' }
  ];
 
  reviews: Review[] = [
    {
      id: 1,
      rating: 5,
      title: 'Best workplace culture ever!',
      position: 'Software Engineer',
      comment: 'Ive been at TechVision for 2 years and the culture is amazing. Work-life balance is respected, and the projects are challenging in the best way.',
      pros: 'Great benefits, supportive management, interesting projects',
      cons: 'Fast-paced environment might not be for everyone',
      date: 'January 15, 2025'
    },
    {
      id: 2,
      rating: 4,
      title: 'Great place to grow professionally',
      position: 'Product Designer',
      comment: 'There are so many opportunities to learn and develop new skills. The company invests in employee growth.',
      pros: 'Learning opportunities, good compensation, flexible schedule',
      cons: 'Communication between departments could be improved',
      date: 'February 10, 2025'
    },
    {
      id: 3,
      rating: 5,
      title: 'Truly values diversity and inclusion',
      position: 'Marketing Specialist',
      comment: 'I appreciate how TechVision actively promotes diversity and creates an inclusive environment where everyone feels valued.',
      pros: 'Inclusive culture, meaningful work, great teammates',
      cons: 'Some projects have tight deadlines',
      date: 'December 5, 2024'
    }
  ];
 
  galleryItems: GalleryItem[] = [
    { id: 1, type: 'image', url: '/assets/images/office-space.jpg', caption: 'Our San Francisco HQ' },
    { id: 2, type: 'image', url: '/assets/images/team-event.jpg', caption: 'Annual team retreat 2024' },
    { id: 3, type: 'video', url: '/assets/videos/company-culture.mp4', caption: 'Life at TechVision' },
    { id: 4, type: 'image', url: '/assets/images/hackathon.jpg', caption: 'Quarterly Innovation Hackathon' },
    { id: 5, type: 'image', url: '/assets/images/office-dogs.jpg', caption: 'Our four-legged team members' }
  ];
 
  filteredJobs: Job[] = [];
 
  constructor(
    private userService: UserService,
    private recruiterService: RecruiterDetailService,
    private router: Router
  ) {}

  private loadLoggedInUserData() {
    this.userService.findLoggedUser()
      .then(user => {
        this.user = user;
        this.userId = user._id;
        this.isCurrentUser = true;
        this.userProfileLink = `${window.location.origin}/profile-seeker/${this.userId}`;
        this.updateUserInfo(user);
      })
      .catch(error => console.error('Error fetching logged-in user data:', error));
  }

  updateUserInfo(user: any) {
    // Implementation for updateUserInfo method
    this.updateId = user._id;
    this.username = user.username;
    this.password = user.password;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.phone = user.phone;
    this.requestStatus = user.requestStatus;
    
    // Handle social media links
    if (user.socialContact && user.socialContact.length !== 0) {
      this.socialContact = user.socialContact;
      this.facebook = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'facebook')?.url || '';
      this.github = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'github')?.url || '';
      this.linkedin = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'linkedin')?.url || '';
      this.twitter = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'twitter')?.url || '';
    }
  }
   
  ngOnInit(): void {
    this.filteredJobs = this.jobListings;
    
    // Check user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.toggleDarkMode();
    }
    
    // Load user and company data from API
    this.loadUserData();
  }
  
  private loadUserData(): void {
    this.userService.findLoggedUser()
      .then((user) => {
        if (user !== null) {
          this.user = user;
          this.userId = user._id;
          this.isCurrentUser = true;
          this.userProfileLink = `${window.location.origin}/profile-seeker/${this.userId}`;
          
          // Update user profile info
          this.updateId = user._id;
          this.username = user.username;
          this.password = user.password;
          this.firstName = user.firstName;
          this.lastName = user.lastName;
          this.email = user.email;
          this.phone = user.phone;
          this.requestStatus = user.requestStatus;
          
          // Load profile picture
          this.loadProfilePic(user._id);
          
          // Handle social media links
          if (user.socialContact && user.socialContact.length !== 0) {
            this.socialContact = user.socialContact;
            this.facebook = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'facebook')?.url || '';
            this.github = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'github')?.url || '';
            this.linkedin = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'linkedin')?.url || '';
            this.twitter = this.socialContact.find((s: { socialtype: string; }) => s.socialtype === 'twitter')?.url || '';
          }
          
          // Load company data
          this.loadCompanyData();
        } else {
          console.log('User: null');
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }
  navigateToJobs(event: Event) {
    event.preventDefault(); // Prevent the default anchor behavior
    this.router.navigate(['/job-list'], { 
      queryParams: { 
        keyword: this.companyName 
      }
    });
  }
  private loadCompanyData(): void {
    this.recruiterService.findRecruiterDetailsByUserId()
      .then((companyData) => {
        if (companyData) {
          this.updateCompanyId = companyData._id;
          
          // Update company details
          this.title = companyData.title || '';
          this.companyName = companyData.company || '';
          this.companyWebsite = companyData.companyWebsite || '';
          this.industry = companyData.industry || '';
          this.location = companyData.location || '';
          this.aboutCompany = companyData.aboutCompany || '';
          this.numberOfEmployees = companyData.numberOfEmployees;
          this.yearEstablished = companyData.yearEstablished;
          this.companyMission = companyData.companyMission || '';
          this.coreValues = companyData.coreValues || '';
          this.employeeBenefits = companyData.employeeBenefits || '';
          this.productsServices = companyData.productsServices || [];
          this.teamMembers = companyData.teamMembers || [];
          
          // Update the company object with dynamic data
          this.updateCompanyObject(companyData);
        }
      })
      .catch(error => {
        console.error('Error fetching company data:', error);
      });
  }
  
  private updateCompanyObject(companyData: any): void {
    // Only override default values if we have actual data
    if (companyData) {
      this.company = {
        name: this.companyName || this.company.name,
        logo: this.profilePicUrl || this.company.logo,
        banner: this.company.banner, // Keep default banner unless provided by API
        tagline: companyData.tagline || this.company.tagline,
        website: this.companyWebsite || this.company.website,
        industry: this.industry || this.company.industry,
        founded: this.yearEstablished ? this.yearEstablished.toString() : this.company.founded,
        size: this.numberOfEmployees ? `${this.numberOfEmployees} employees` : this.company.size,
        location: this.location || this.company.location,
        description: this.aboutCompany || this.company.description,
        mission: this.companyMission || this.company.mission,
        vision: companyData.vision || this.company.vision,
        overallRating: companyData.overallRating || this.company.overallRating,
        totalReviews: companyData.totalReviews || this.company.totalReviews
      };
      
      // Parse benefits if available
      if (this.employeeBenefits) {
        try {
          // Try to parse as JSON if it's a string
          const parsedBenefits = typeof this.employeeBenefits === 'string' 
            ? JSON.parse(this.employeeBenefits) 
            : this.employeeBenefits;
          
          if (Array.isArray(parsedBenefits)) {
            this.benefits = parsedBenefits;
          }
        } catch (e) {
          console.log('Benefits not in JSON format, using as text');
          // Keep default benefits
        }
      }
    }
  }
  
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
  
  filterJobs(filter: string): void {
    this.selectedJobFilter = filter;
    
    if (filter === 'all') {
      this.filteredJobs = this.jobListings;
      return;
    }
    
    this.filteredJobs = this.jobListings.filter(job => {
      if (filter === 'remote' && job.location === 'Remote') return true;
      if (filter === 'fulltime' && job.type === 'Full-time') return true;
      if (filter === 'parttime' && job.type === 'Part-time') return true;
      return false;
    });
  }
  
  prevGalleryItem(): void {
    this.currentGalleryIndex = this.currentGalleryIndex === 0 ? 
      this.galleryItems.length - 1 : this.currentGalleryIndex - 1;
  }
  
  nextGalleryItem(): void {
    this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryItems.length;
  }
  
  setGalleryItem(index: number): void {
    this.currentGalleryIndex = index;
  }
  
  // Profile and editing methods from old component
  edit(): void {
    this.editMode = true;
  }
  
  cancel(): void {
    this.editMode = false;
  }
  
  update(): void {
    const social = [
      { 'socialtype': 'github', 'url': this.github },
      { 'socialtype': 'linkedin', 'url': this.linkedin },
      { 'socialtype': 'facebook', 'url': this.facebook },
      { 'socialtype': 'twitter', 'url': this.twitter }
    ];
    
    const updatedUser = {
      'username': this.username,
      'firstName': this.firstName,
      'lastName': this.lastName,
      'email': this.email,
      'phone': this.phone,
      'socialContact': social
    };
    
    const company = {
      'title': this.title,
      'company': this.company.name,
      'companyName': this.companyName,
      'companyWebsite': this.companyWebsite,
      'industry': this.industry,
      'location': this.location,
      'aboutCompany': this.aboutCompany,
      'numberOfEmployees': this.numberOfEmployees,
      'yearEstablished': this.yearEstablished,
      'companyMission': this.companyMission,
      'coreValues': this.coreValues,
      'employeeBenefits': this.employeeBenefits,
      'productsServices': this.productsServices,
      'teamMembers': this.teamMembers
    };
    
    this.editMode = false;
    
    // Update user profile
    this.userService.updateUserProfile(updatedUser)
      .then((updatedUser) => {
        // Update company details
        this.recruiterService.updateRecruiterDetail(this.updateCompanyId, company)
          .then((updatedRecruiter) => {
            console.log('Update success');
            // Refresh data
            this.loadUserData();
          })
          .catch(error => {
            console.error('Error updating company data:', error);
          });
      })
      .catch(error => {
        console.error('Error updating user data:', error);
      });
  }
  
  // Profile picture handling
  loadProfilePic(userId: string): void {
    this.userService.getProfilePic(userId).subscribe(
      (data: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.profilePicUrl = reader.result as string;
          this.profilePicExist = true;
        };
        reader.readAsDataURL(data);
      },
      (error) => {
        console.error('Error fetching profile picture:', error);
        this.setDefaultProfilePic();
      }
    );
  }
  
  setDefaultProfilePic(): void {
    this.profilePicUrl = 'assets/defaultLogo.png';
    this.profilePicExist = false;
  }
  
  openProfilePicModal(): void {
    if (this.isCurrentUser) {
      this.isProfilePicModalOpen = true;
    }
  }
  
  closeProfilePicModal(): void {
    this.isProfilePicModalOpen = false;
  }
  
  onProfilePicSelected(event: any): void {
    // Only allow profile pic updates for current user
    if (!this.isCurrentUser) return;
    
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePic', file, file.name);
      formData.append('userId', this.userId);
      
      this.userService.uploadProfilePic(formData).subscribe(
        (response: any) => {
          if (response.file_uploaded) {
            this.profilePicUrl = response.profilePicUrl;
            this.profilePicExist = true;
            this.closeProfilePicModal();
            alert("uploaded successfully");
            
            // Refresh the data
            setTimeout(() => {
              this.loadUserData();
            }, 1000);
          }
        },
        error => console.error('Error uploading file:', error)
      );
    }
  }
  
  droppedProfilePic(files: NgxFileDropEntry[]): void {
    // Only allow profile pic updates for current user
    if (!this.isCurrentUser) return;
    
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const formData = new FormData();
          formData.append('profilePic', file, file.name);
          formData.append('userId', this.userId);
          
          this.userService.uploadProfilePic(formData).subscribe(
            (response: any) => {
              if (response.file_uploaded) {
                this.profilePicUrl = response.profilePicUrl;
                this.profilePicExist = true;
                this.closeProfilePicModal();
                alert("uploaded successfully");
                
                // Refresh the data
                setTimeout(() => {
                  this.loadUserData();
                }, 1000);
              }
            },
            error => console.error('Error uploading file:', error)
          );
        });
      }
    }
  }
  
  // Products and team members management
  addProductService(): void {
    this.productsServices.push('');
  }
  
  removeProductService(index: number): void {
    this.productsServices.splice(index, 1);
  }
  
  addTeamMember(): void {
    this.teamMembers.push({ name: '', position: '' });
  }
  
  removeTeamMember(index: number): void {
    this.teamMembers.splice(index, 1);
  }
  
  // Tab navigation
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
  
  // Helper method to check if URL is empty
  checkHidden(url: string): boolean {
    return url === '';
  }
}