import { Component, OnInit, Renderer2 } from '@angular/core';
import { UserService } from './services/user.service';
import { User } from './models/user.model.client';
import { Router, NavigationEnd, ActivatedRoute, Event } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'HiyrNow';
  isNavVisible = false;
  user: User = new User(); 
  isMenuOpen = false;
  profilePicUrl: string = '';
  profilePicExist: boolean = false;
  imageUrl = 'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg';
  isDrawerOpen: boolean = false;
  showSide: boolean = false;
  isDropdownOpen = false;
  isUserMenuOpen = false;
  isDisabled =true
  isProfileDropdownOpen: boolean=false;
  isDropdownVisible: boolean=false;
  private mouseLeaveTimer: any;
  searchTerm: string = '';
  isFocused: boolean = false;
  closeTimer: any;

  isHomeRoute: boolean = false;
  userID: any;
  constructor(
    private seoService: SeoService,
    private userService: UserService,
    private router: Router,
    private renderer: Renderer2,
    private meta: Meta,
    private titleService: Title,
    private activatedRoute: ActivatedRoute
    
  ) {
    this.router.events.subscribe(() => {
      this.isHomeRoute = this.router.url === '/home';
    });
  }
  

  ngOnInit() {
    this.sessionCheck();

    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {});

    this.updateMetaTags();
  }
  onSidebarMouseEnter() {
    if (this.isDrawerOpen == false) {
      // Clear any existing timer
      if (this.mouseLeaveTimer) {
        clearTimeout(this.mouseLeaveTimer);
      }
      
      // Open the drawer
      this.isDrawerOpen = true;
    }
  }

  onSidebarMouseLeave() {
    // Set a short delay before closing the drawer
    this.mouseLeaveTimer = setTimeout(() => {
      this.isDrawerOpen = false;
    }, 200); // Adjust the delay as needed
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      // Implement search logic here
      console.log('Searching for:', this.searchTerm);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
  }

  // Optional: Method to cancel the timer if mouse re-enters before closing
  cancelMouseLeaveTimer() {
    if (this.mouseLeaveTimer) {
      clearTimeout(this.mouseLeaveTimer);
    }
  }
  startCloseTimer() {
    // Delay closing to allow interaction with dropdown
    this.closeTimer = setTimeout(() => {
      this.isProfileDropdownOpen = false;
    }, 300); // 300ms delay
  }

  cancelCloseTimer() {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  handleCreditsClick() {
    this.cancelCloseTimer();
    this.router.navigate(['/credits']);
    this.isProfileDropdownOpen = false;
  }

  handleSettingsClick() {
    this.cancelCloseTimer();
    this.router.navigate(['/settings']);
    this.isProfileDropdownOpen = false;
  }

    
  openProfileDropdown() {
    this.isProfileDropdownOpen = true;
  }

 


 

  closeprofiledorp(){
    this.isProfileDropdownOpen = false
  }

  navigateToSettings() {
    // Navigate to settings page based on user role
    if (this.user?.role === 'JobSeeker') {
      this.router.navigate(['/profile', this.userID]);

    } else if (this.user?.role === 'Recruiter') {
      this.router.navigate(['/company/profile']);
    }
    this.isProfileDropdownOpen = false;
  }

  updateMetaTags() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(event => {
      this.titleService.setTitle(event['title']);
      this.meta.updateTag({ name: 'description', content: event['description'] });
      this.meta.updateTag({ name: 'keywords', content: event['keywords'] });
    });
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }



  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  private loadScript(src: string): void {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.defer = true;
    this.renderer.appendChild(document.head, script);
  }

  // loadProfilePic(userId: string): void {
  //   this.userService.getProfilePic(userId).subscribe(
  //     (data: Blob) => {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         this.profilePicUrl = reader.result as string;
  //         this.profilePicExist = !!this.profilePicUrl;
  //       };
  //       reader.readAsDataURL(data);
  //     },
  //     error => {
  //       console.error('Error fetching profile picture:', error);
  //     }
  //   );
  // }
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
        this.setDefaultProfilePic(); // Use default picture if there's an error
      }
    );
  }
  
  setDefaultProfilePic(): void {
    if (this.user.role === 'JobSeeker') {
      this.profilePicUrl = 'assets/defaultUser.png'; // Default for job seekers
    } else if (this.user.role  === 'Recruiter') {
      this.profilePicUrl = 'assets/defaultLogo.png'; // Default for recruiters
    } else {
      this.profilePicUrl = 'assets/default.png'; // Fallback default
    }
    this.profilePicExist = false;
  }

  sessionCheck(): void {
    this.userService.findLoggedUser().then(user => {
      this.user = user;
      this.userID= this.user._id
      if (this.user && this.user._id) {
        this.loadProfilePic(this.user._id);
          this.showSide=true
      }
    });
  }

  logout(): void {
    this.userService.logout().then(() => this.router.navigate(['/**']))
      .then(() => this.sessionCheck());
      this.showSide=false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isDropdownOpen = false;
  }
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
}
