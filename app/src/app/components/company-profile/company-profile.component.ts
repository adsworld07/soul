// company-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-company-profile',

  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit {
  isDarkMode = false;
  selectedJobFilter = 'all';
  currentGalleryIndex = 0;
  
  company = {
    name: 'TechVision Innovations',
    logo: '/assets/images/techvision-logo.png',
    banner: '/assets/images/company-banner.jpg',
    tagline: 'Building the future of technology, one innovation at a time',
    website: 'https://techvision.io',
    industry: 'Software & Tech',
    founded: '2015',
    size: '500-1000 employees',
    location: 'San Francisco, CA (HQ) + Remote',
    description: `TechVision Innovations is a forward-thinking tech company specializing in AI-powered solutions that transform industries. We create intuitive software that helps businesses streamline operations and deliver exceptional customer experiences.`,
    mission: 'To empower organizations with intelligent technology that drives meaningful change and sustainable growth.',
    vision: 'A world where cutting-edge technology is accessible to all, creating opportunities and solving humanitys greatest challenges.',
  
    overallRating: 4.7,
    totalReviews: 328
  };
  
  benefits = [
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
  
  ngOnInit(): void {
    this.filteredJobs = this.jobListings;
    // Check user's preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.toggleDarkMode();
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
}