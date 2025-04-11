// app/../../services/skill.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SkillService {

  url: string;

  constructor() {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend';
    } else {
      base = 'http://localhost:5500';
    }
    this.url = base + '/api/skill';
  }

  findAllSkills() {
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

  findSkillByUserId() {
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

  createSkill(skill: {skillName:any; skillLevel:any;}) {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(skill),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  updateSkill(skillId: string, skill: {skillName:any; skillLevel:any;}) {
    return fetch(this.url + '/' + skillId, {
      method: 'PUT',
      body: JSON.stringify(skill),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json();
    });
  }

  deleteSkill(skillId: string) {
    return fetch(this.url + '/' + skillId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }
}
