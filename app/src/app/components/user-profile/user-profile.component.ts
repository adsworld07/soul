// user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { ResumeUploadService } from 'src/app/services/resume-upload.service';
import { UserService } from 'src/app/services/user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  isLoading: boolean = true;
  isCurrentUser: boolean = false;
  activeTab: string = 'skills';
  isDesktop: boolean = false;
  
  education: any;
  experiences: any;
  projects: any;
  skills: any;
  banner:string= '/assets/images/company-banner.jpg'
  isProfilePicModalOpen = false;
  profilePicUrl: string = 'assets/defaultLogo.png';
  profilePicExist = false;
  files: { filename: any; originalname: any; contentType: any; }[] = [];
  filesExist: boolean = false;
  isEditBioModalOpen: boolean = false;
  dropdownOpen!: boolean;
  tagline: any;
  editMode: boolean = false;
  requestedUserId: string | null = null;
  showPersonalInfo = false;
  constructor(
    private userService: UserService,
    // private authService: AuthService
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private resumeUploadService:ResumeUploadService
  ) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .subscribe(result => {
      this.isDesktop = result.matches;
    });


    this.loadUserProfile();
  }
 

  togglePersonalInfo() {
    this.showPersonalInfo = !this.showPersonalInfo;
  }
  saveBio() {
    // Only allow bio updates for current user
    if (!this.isCurrentUser) return;

    const updateduser = {
      'tagline': this.tagline,
    };
    this.isEditBioModalOpen = false;
    this.userService.updateUserProfile(updateduser)
      .then((updatedUser) => {
        console.log('Update success');
        window.location.reload();
      });
  }

  // UI helper methods
  editBio() {
    if (this.isCurrentUser) {
      this.editMode = true;
    }
  }

  openEditBioModal() {
    if (this.isCurrentUser) {
      this.isEditBioModalOpen = true;
      this.dropdownOpen = false;
    }
  }
  cancel() {
    this.editMode = false;
    this.isEditBioModalOpen = false;
  }
  fetchFileNames() {
    this.resumeUploadService.showFileNames().subscribe(
      (response: any[]) => {
        if (response.length > 0) {
          const latestFile = response[response.length - 1];
          this.files = [{
            filename: latestFile.filename,
            originalname: latestFile.originalname,
            contentType: latestFile.contentType
          }];
          this.filesExist = true;
        } else {
          this.files = [];
          this.filesExist = false;
        }
      },
      error => {
        console.error('Error fetching file names:', error);
      }
    );
  }


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
  loadUserProfile(): void {
    // Get the user ID from the route or use the current user's ID
    const userId = this.getRequestedUserId();
    
    if (userId !== null) {
      this.userService.getUserDetails(userId).subscribe({
        next: (userData) => {
          if (userData?.status === "success" && userData.data?.user) {
            this.user = userData.data.user; // Extract user details
            this.education = userData.data.education || []; // Extract education details
            this.experiences = userData.data.experiences || []; // Extract experiences
            this.projects = userData.data.project || []; // Extract projects
            this.skills = userData.data.skill || []; // Extract skills
            // this.fetchFileNames()
            // Load profile picture
            this.loadProfilePic(this.user._id);
          } else {
            console.error("Invalid response structure:", userData);
          }
          
          this.isLoading = false;
          
          // Check if this is the current logged-in user
          this.userService.getCurrentUser().subscribe(currentUser => {
            
            this.isCurrentUser = currentUser === this.user?._id;
          
          });
        },
        error: (error) => {
          console.error("Error loading user profile:", error);
          this.isLoading = false;
        }
      });
    } else {
      console.error("User ID is null");
      this.isLoading = false;
    }
  }
  
  
  getRequestedUserId(): string | null {
    this.requestedUserId = this.route.snapshot.paramMap.get('userId'); // Get ID from route
    console.log('Requested User ID:', this.requestedUserId);
    return this.requestedUserId;
  }
  
  changeTab(tab: string): void {
    this.activeTab = tab;
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
      formData.append('userId', this.user._id);
      
      this.userService.uploadProfilePic(formData).subscribe(
        (response: any) => {
          if (response.file_uploaded) {
            this.profilePicUrl = response.profilePicUrl;
            this.profilePicExist = true;
            this.closeProfilePicModal();
            alert("uploaded successfully");
            
            // Refresh the data
            setTimeout(() => {
              // this.loadUserData();
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
          formData.append('userId', this.user._id);
          
          this.userService.uploadProfilePic(formData).subscribe(
            (response: any) => {
              if (response.file_uploaded) {
                this.profilePicUrl = response.profilePicUrl;
                this.profilePicExist = true;
                this.closeProfilePicModal();
                alert("uploaded successfully");
                
                // Refresh the data
                setTimeout(() => {
                  // this.loadUserData();
                }, 1000);
              }
            },
            error => console.error('Error uploading file:', error)
          );
        });
      }
    }
  }


  getSocialIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      linkedin: 'fa-brands fa-linkedin text-blue-600',
      github: 'fa-brands fa-github text-gray-800',
      twitter: 'fa-brands fa-x-twitter text-black',
      facebook: 'fa-brands fa-facebook text-blue-600',
      instagram: 'fa-brands fa-instagram text-pink-500',
    };
    return icons[platform.toLowerCase()] || 'fa-solid fa-link';
  }
}