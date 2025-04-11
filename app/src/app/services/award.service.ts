// app/../../services/award.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AwardService {

  url: string;

  constructor() {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
      // http://localhost:5500
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base + '/api/award';
  }

  createAward(award: any) {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(award),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  findAwardByUserId(userId: string) {
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

  updateAward(awardId: string, award: any) {
    return fetch(this.url + '/' + awardId, {
      method: 'PUT',
      body: JSON.stringify(award),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  deleteAward(awardId: string) {
    return fetch(this.url + '/' + awardId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }
}
