import { HttpClient } from '@angular/common/http';

import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-pvc-list',
  templateUrl: './pvc-list.component.html',
  styleUrls: ['./pvc-list.component.css']
})
export class PVCListComponent  {
 
  pvcListUsers: any;
  url: string;


  constructor( private http: HttpClient) { 
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base;
  }
  
  ngOnInit() {
 
  this.getPVCListUsers()
  }
  getPVCListUsers() {
    this.http.get(`${this.url}/api/pvcList`).subscribe((users: any) => {
      this.pvcListUsers = users;
      console.log('PVC list users:', this.pvcListUsers);
    }, (error: any) => {
      console.error('Error fetching PVC list users', error);
    });
  }
  
}
