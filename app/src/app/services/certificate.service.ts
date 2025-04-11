// app/../../services/certificate.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  url: string;

  constructor() {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base + '/api/certificate';
  }

  createCertificate(certificate: any) {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(certificate),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  findCertificateByUserId(userId: string) {
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

  updateCertificate(certificateId: string, certificate: any) {
    return fetch(this.url + '/' + certificateId, {
      method: 'PUT',
      body: JSON.stringify(certificate),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  deleteCertificate(certificateId: string) {
    return fetch(this.url + '/' + certificateId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }
}
