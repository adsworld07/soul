import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface Feature {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

@Component({
  selector: 'app-job-board',
  templateUrl: './job-board.component.html',
  styleUrls: ['./job-board.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('0.8s cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class JobBoardComponent implements OnInit {
  keywordOrTitle: string = '';
  location: string = '';

  features: Feature[] = [
    {
      icon: '✨',
      title: 'AI-Powered Match',
      description: 'Find your dream job with our vibe-matching AI',
      bgColor: 'bg-purple-100'
    },
    {
      icon: '🚀',
      title: 'One-Tap Apply',
      description: 'Apply instantly - no cap!',
      bgColor: 'bg-blue-100'
    },
    {
      icon: '💫',
      title: 'Secure & Verified',
      description: 'Your docs are safe with us fr fr',
      bgColor: 'bg-teal-100'
    }
  ];

  jobSeekerBenefits = [
    {
      icon: '🎯',
      title: 'Your Perfect Feed',
      description: 'Jobs that match your actual skills & interests'
    },
    {
      icon: '📈',
      title: 'Level Up',
      description: 'AI-powered skill analysis & career coaching'
    },
    {
      icon: '🌟',
      title: 'Elite Network',
      description: 'Join the coolest professional community'
    }
  ];

  stats = [
    { value: '10K+', label: 'Active Users', icon: '👥' },
    { value: '300+', label: 'Companies', icon: '🏢' },
    { value: '50K+', label: 'Job Matches', icon: '🤝' },
    { value: '95%', label: 'Success Rate', icon: '🎯' }
  ];

  testimonials = [
    {
      content: "No cap, found my dream job in weeks! The AI matching is actually insane.",
      author: "Rahul S.",
      role: "Software Dev",
      avatar: 'assets/avatars/rahul.jpg'
    },
    {
      content: "Fr fr, best platform for finding tech talent! Changed our hiring game.",
      author: "Shrishti M.",
      role: "HR Lead",
      avatar: 'assets/avatars/shrishti.jpg'
    }
  ];
  clients = [
    { 
      name: 'Pure AI', 
      logo: '../../../assets/images/pure AI.jpg' 
    },
    { 
      name: 'Apiria', 
      logo: '../../../assets/images/Apiria_logo.avif' 
    },
    { 
      name: 'Riskcovery', 
      logo: '../../../assets/images/riskcovery.png' 
    },
    { 
      name: 'Grene Robotics', 
      logo: '../../../assets/images/grenerobotics.png' 
    },
    { 
      name: 'Arting', 
      logo: '../../../assets/images/Arting_logo.avif' 
    },
    { 
      name: 'Shipzy', 
      logo: '../../../assets/images/stackAI_logo.avif' 
    },
    { 
      name: 'RETL', 
      logo: '../../../assets/images/RETL.jpeg' 
    },
    { 
      name: 'Dwiggly', 
      logo: '../../../assets/images/dwiggly.png' 
    },
    { 
      name: 'tericsoft', 
      logo: '../../../assets/images/tericsoft_logo.avif' 
    }
  ];

  // Duplicate the array for seamless scrolling
  duplicatedClients = [...this.clients, ...this.clients];

  constructor(private router: Router) {}

  ngOnInit() {}

  searchJobs() {
    this.router.navigate(['/job-list'], { 
      queryParams: { 
        location: this.location,
        keyword: this.keywordOrTitle 
      }
    });
  }
  scrollToSearch() {
      document.getElementById('job-search')?.scrollIntoView({ behavior: 'smooth' });
    }
    getFeatureIcon(icon: Feature['icon']): string {
      const icons: Record<Feature['icon'], string> = {
        'search': '🔍',
        'rocket': '🚀',
        'network': '🌐'
      };
      return icons[icon] || '✨';
    }
  }

@Pipe({ name: 'searchFilter' })
export class SearchFilterPipe implements PipeTransform {
  transform(value: any, search: string): any {
    if (!search) {
      return value;
    }
    return value.filter((v: string) => {
      if (!v) {
        return;
      }
      return v.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    });
  }
}