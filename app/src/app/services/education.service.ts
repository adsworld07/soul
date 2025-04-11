// app/../../services/education.service.ts
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EducationService {

  url: string;

  constructor() {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base + '/api/education';
  }

  findEducationByUserId() {
    console.log('test pass');
    return fetch(this.url + '/user', {
      credentials: 'include',
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  updateEducation(educationId: string, education: { degree: any; fieldOfStudy: any; institute: any; location: any; startDate: { month: string; year: string; }; endDate: { month: string; year: string; }; ongoingStatus: boolean; description: any; }) {
    // console.log(JSON.stringify(user));
    return fetch(this.url + '/' + educationId, {
      method: 'PUT',
      body: JSON.stringify(education),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then((response) => {
      return response.json();
    });
  }

  createEducation(education: { institute: any; location: any; startDate: { month: string; year: string; }; endDate: { month: string; year: string; }; ongoingStatus: boolean; description: any; fieldOfStudy: any; degree: any; }) {
    // console.log(JSON.stringify(user));
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(education),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then((response) => {
      return response.json();
    });
  }

  deleteEducation(Id: string) {
    return fetch(this.url + '/' + Id, {
      method: 'DELETE',
      credentials: 'include'
    });
  }

}
