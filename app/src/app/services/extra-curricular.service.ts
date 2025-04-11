// app/../../services/extracurricular.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExtracurricularService {

  url: string;

  constructor() {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base + '/api/extraCurricular';
  }

  createExtracurricular(extracurricular: any) {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(extracurricular),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  findExtracurricularByUserId(userId: string) {
    return fetch(this.url + `/${userId}`, {
      credentials: 'include',
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  updateExtracurricular(extracurricularId: string, extracurricular: any) {
    return fetch(this.url + '/' + extracurricularId, {
      method: 'PUT',
      body: JSON.stringify(extracurricular),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  deleteExtracurricular(extracurricularId: string) {
    return fetch(this.url + '/' + extracurricularId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }
}
