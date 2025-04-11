// services/filter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  // private url = '/api/filter';
  url: string;
  constructor(private http: HttpClient) {

  let base;
  if (!location.toString().includes('localhost')) {
    base = 'https://hiyrnow.in/backend';
  } else {
    base = 'http://localhost:5500';
  }
  this.url = base + '/api/filter';
}


  createFilter(filter: any): Observable<any> {
    return this.http.post(`${this.url}`, filter,{ withCredentials: true});
  }

  getFilters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}`,{ withCredentials: true});
  }

  deleteFilter(filterId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${filterId}`,{ withCredentials: true});
  }
}
