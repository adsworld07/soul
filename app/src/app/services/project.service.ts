// app/../../services/project.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  url: string;

  constructor() {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base + '/api/project';
  }

  findAllProjects() {
    return fetch(this.url, {
      credentials: 'include',
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  findProjectByUserId() {
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

  createProject(project: any) {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(project),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  updateProject(projectId: string, project: any) {
    return fetch(this.url + '/' + projectId, {
      method: 'PUT',
      body: JSON.stringify(project),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  deleteProject(projectId: string) {
    return fetch(this.url + '/' + projectId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }
}
