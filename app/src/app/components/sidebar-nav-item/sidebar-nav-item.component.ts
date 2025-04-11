import { Component, Input } from '@angular/core';

@Component({
  selector: 'SidebarNavItem',
  template: `
      <a 
          [routerLink]="routerLink"
          class="flex items-center px-4 py-2.5 text-gray-800 hover:bg-gray/10 transition-colors duration-300 group"
      >
          <div class="flex items-center">
              <svg 
                  *ngIf="icon === 'user'"
                  class="w-6 h-6 mr-3 opacity-70 group-hover:opacity-100" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a8 8 0 00-8 8h16a8 8 0 00-8-8z" />
              </svg>
              <svg 
                  *ngIf="icon === 'dashboard'"
                  class="w-6 h-6 mr-3 opacity-70 group-hover:opacity-100" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <svg 
                  *ngIf="icon === 'briefcase'"
                  class="w-6 h-6 mr-3 opacity-70 group-hover:opacity-100" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg 
                  *ngIf="icon === 'settings'"
                  class="w-6 h-6 mr-3 opacity-70 group-hover:opacity-100" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              
              <span 
                  *ngIf="!isCompact" 
                  class="ml-3 text-sm font-medium group-hover:text-gray/90"
              >
                  {{ label }}
              </span>
          </div>
      </a>
  `
})
export class SidebarNavItemComponent {
  @Input()
  routerLink!: string;
  @Input()
  icon!: 'user' | 'dashboard' | 'briefcase' | 'settings';
  @Input()
  label!: string;
  @Input() isCompact: boolean = false;
}
