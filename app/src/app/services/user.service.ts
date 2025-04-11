import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, catchError, throwError, retry, timeout } from 'rxjs';
import { User } from '../models/user.model.client';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface CreditTransaction {
  type: string;
  amount: number;
  timestamp: Date;
  previousBalance: number;
  newBalance: number;
  adminId: string;
}

export interface CreditManagementResponse {
  success: boolean;
  message: string;
  newBalance?: number;
  transaction?: CreditTransaction;
  error?: string;
}

export interface IntegrationResponse {
  success: boolean;
  message: string;
  authUrl?: string;
  profile?: any;
  state?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private base: string;
  url: string;
  urlRegister: string;
  urlLoggedUser: string;
  urlLoggedRecruiter: string;
  urlUpdateProfile: string;
  urlLogin: string;
  urlPassReset: string;
  urlVerifyUsername: string;
  urlLogout: string;
  urlDeleteProfile: string;
  urlApproveRecruiter: string;
  urlPending: string;
  urlRecruiterProfile: string;
  urlPremiumGrant: string;
  urlPremiumRevoke: string;
  urlProfilePic: string;
  urlUserProfile: string;
  profileDetails: string;
  matchingjob: string;
  userResume: string;
  downloadresume: string;
  profileScore: string;
  dashboard: string;
  credits: string;
  restpassword: string;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Determine base URL based on platform and environment
    if (isPlatformBrowser(this.platformId)) {
      this.base = !location.toString().includes('localhost') 
        ? 'https://hiyrnow.in/backend'
        : 'http://localhost:5500';
    } else {
      // Server-side default URL
      this.base = 'http://localhost:5500';
    }

    // Initialize all URLs using the base
    this.restpassword = this.base + '/api';
    this.urlProfilePic = this.base;
    this.url = this.base + '/api/user';
    this.urlRegister = this.base + '/api/register';
    this.urlLoggedUser = this.base + '/api/profile';
    this.urlLoggedRecruiter = this.base + '/api/profile/recruiter';
    this.urlUpdateProfile = this.base + '/api/profile';
    this.urlLogin = this.base + '/api/login';
    this.urlPassReset = this.base + '/api/reset';
    this.urlVerifyUsername = this.base + '/api/verify';
    this.urlLogout = this.base + '/api/logout';
    this.urlDeleteProfile = this.base + '/api/user';
    this.urlApproveRecruiter = this.base + '/api/approve';
    this.urlPending = this.base + '/api/pending';
    this.urlRecruiterProfile = this.base + '/api/profile/recruiter';
    this.urlPremiumGrant = this.base + '/api/premium/approve';
    this.urlPremiumRevoke = this.base + '/api/premium/revoke';
    this.urlUserProfile = this.base + '/api/user/user-profile';
    this.profileDetails = this.base + '/api/user/details';
    this.matchingjob = this.base + '/api/match-jobs';
    this.userResume = this.base + '/api/user/reusme';
    this.downloadresume = this.base + '/api/file';
    this.profileScore = this.base + '/api/profile/score';
    this.dashboard = this.base + '/api/dashboard';
    this.credits = this.base + '/api';
  }
 


  findUserByUsername(username: string): Observable<any> {
    return this.http.get(`${this.credits}/users/${username}`);
  }

  googleLogin(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `${this.urlProfilePic}/api/auth/google`;
    }
  }

  // Add credits by admin
  addCredits(userId: string, amount: number): Observable<CreditManagementResponse> {
    console.log("userrrrid",userId)
    return this.http.post<CreditManagementResponse>(
      `${this.credits}/admin/credits/add`, 
      { userId, amount },
      { withCredentials: true } // Ensures cookies and credentials are sent
    );
  }

  // Remove credits by admin
  removeCredits(userId: string, amount: number): Observable<CreditManagementResponse> {
    return this.http.post<CreditManagementResponse>(`${this.credits}/admin/credits/remove`, {
      userId,
      amount
    });
  }

  // Get user's credit balance
  getUserCreditBalance(userId: string): Observable<{ points: number }> {
    return this.http.get<{ points: number }>(`${this.credits}/credits/balance?userId=${userId}`);
  }

  // Get user's credit transactions
  getUserCreditTransactions(userId: string): Observable<{ transactions: CreditTransaction[] }> {
    return this.http.get<{ transactions: CreditTransaction[] }>(`${this.credits}/credits/transactions?userId=${userId}`);
  }

  // getCurrentUser(): Observable<any> {
  //   return this.http.get(`${this.urlProfilePic}/api/current_user`);
  // }
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.urlProfilePic}/api/current_user`, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }
  getDashboardData(userId: string): Observable<any> {
    return this.http.get(`${this.dashboard}/${userId}`, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateIntegrationStatus(userId: string, type: string, status: boolean): Observable<any> {
    return this.http.put(`${this.dashboard}/${userId}/integration/${type}`, 
      { status }, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Add new method for manual dashboard updates if needed
  updateDashboardData(userId: string, dashboardData: any): Observable<any> {
    return this.http.put(`${this.dashboard}/${userId}`, 
      dashboardData, 
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  downloadPDF(filename: string ,userId: string ): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(`${this.downloadresume}/${filename}/${userId}`, {
      responseType: 'blob',
      headers: headers,
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getUserDetails(userId: string, feature?: string): Observable<any> {
    let params = new HttpParams();
    if (feature) {
      params = params.set('feature', feature);
    }
  
    // Combine params and withCredentials into a single options object
    const options = {
      params,
      withCredentials: true
    };
  
    return this.http.get<User>(`${this.profileDetails}/${userId}`, options);
  }
  
  getUserResume(userId: string): Observable<any> {
    return this.http.get<User>(`${ this.userResume}/${userId}`);
  }

  getMatchedJobs(userId: string): Observable<any> {
    return this.http.get(`${this.matchingjob}/${userId}`);
  }

  getProfileCompletionScore(userId: string): Observable<{
    sectionsCompleted: number;
    totalSections: number;
    remainingSections: never[];
    score: number;
  }> {
    return this.http.get<{
      sectionsCompleted: number;
      totalSections: number;
      remainingSections: never[];
      score: number;
    }>(`${this.profileScore}/${userId}`);
  }

  getUserProfileById(userId: string): Observable<any> {
    return this.http.get(`${this.urlUserProfile}/${userId}`);
  }

  register(user: { username: any; password: any; role: any; email: any; } | { username: any; password: any; role: any; email?: undefined; }) {
    return fetch(this.urlRegister, {
      method: 'POST',
      body: JSON.stringify(user),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  login(identifier: string, password: string) {
    return fetch(this.urlLogin, {
      method: 'POST',
      body: JSON.stringify({ username: identifier, password: password }),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  logout() {
    return fetch(this.urlLogout, {
      method: 'POST',
      credentials: 'include',
    });
  }

  findLoggedUser() {
    return fetch(this.urlLoggedUser, {
      credentials: 'include',
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }
 
  

  findLoggedRecruiter() {
    return fetch(this.urlLoggedRecruiter, {
      credentials: 'include',
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  updateUserProfile(user: { username?: string; firstName?: string; lastName?: string; email?: string; phone?: string; socialContact?: { socialtype: string; url: string; }[] | { socialtype: string; url: string; }[]; premiumRequestStatus?: string; tagline?: string; }) {
    return fetch(this.urlUpdateProfile, {
      method: 'PUT',
      body: JSON.stringify(user),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  deleteUser(userId: string) {
    return fetch(this.url + '/' + userId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }

  uploadProfilePic(formData: FormData): Observable<any> {
    // Log FormData contents before sending
  
    return this.http.post(`${this.urlProfilePic}/upload-profile-pic`, formData ,{
    withCredentials: true
  });
}

  getProfilePic(userId: string): Observable<Blob> {
    return this.http.get(`${this.urlProfilePic}/profile-pic/${userId}`, { responseType: 'blob' });
  }

  createUser(user: { username: any; password: any; role: string; }) {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(user),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  approveRecruiter(userId: string) {
    return fetch(this.urlApproveRecruiter + '/' + userId, {
      method: 'POST',
      credentials: 'include'
    });
  }

  rejectRecruiter(userId: string) {
    return fetch(this.url + '/' + userId, {
      method: 'DELETE',
      credentials: 'include'
    });
  }

  grantPremiumAccess(userId: string) {
    return fetch(this.urlPremiumGrant + '/' + userId, {
      method: 'POST',
      credentials: 'include'
    });
  }

  imageUrlUpload(userId: string, imageUrl: string) {
    return fetch(imageUrl + '/' + userId, {
      method: 'POST',
      credentials: 'include'
    });
  }

  revokePremiumAccess(userId: string) {
    return fetch(this.urlPremiumRevoke + '/' + userId, {
      method: 'POST',
      credentials: 'include'
    });
  }

  getUserProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${ this.urlUserProfile}/${userId}`);
  }
  
  findPendingRecruiters() {
    return fetch(this.urlPending, {
      credentials: 'include'
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  addRecruiterProfile(recruiter: any) {
    return fetch(this.urlRecruiterProfile, {
      method: 'POST',
      body: JSON.stringify(recruiter),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  findAllUsers() {
    return fetch(this.url, {
      credentials: 'include'
    }).then(response => {
      if (response.headers.get('content-type') != null) {
        return response.json();
      } else {
        return null;
      }
    });
  }

  importLinkedInProfile() {
    // Endpoint that triggers LinkedIn OAuth and profile data import
    return this.http.get('/api/user/import-linkedin-profile').toPromise();
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.restpassword}/request-password-reset`, { email });
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.restpassword}/reset-password`, data);
  }

  initiateLinkedInAuth(): Observable<IntegrationResponse> {
    return this.http.get<IntegrationResponse>(
        `${this.base}/api/dashboard/integration/linkedin/auth`,
        {
            withCredentials: true,
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        }
    ).pipe(
        retry(2),
        timeout(15000),
        catchError(error => {
            console.error('LinkedIn auth initialization failed:', error);
            return throwError(() => new Error(
                error.status === 0 ? 'Network error. Please check your connection.' :
                error.status === 504 ? 'Service timeout. Please try again.' :
                'Unable to connect to LinkedIn. Please try again.'
            ));
        })
    );
}

handleLinkedInCallback(code: string, state: string): Observable<IntegrationResponse> {
    return this.http.post<IntegrationResponse>(
        `${this.base}/api/dashboard/integration/linkedin/callback`,
        { code, state },
        {
            withCredentials: true,
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }
    ).pipe(
        retry(1),
        timeout(20000),
        catchError(error => {
            console.error('LinkedIn callback processing failed:', error);
            return throwError(() => new Error(
                error.name === 'TimeoutError' ? 'LinkedIn service timeout. Please try again.' :
                'Failed to complete LinkedIn integration. Please try again.'
            ));
        })
    );
}

  // Calendar Integration
  connectCalendar(calendarType: 'google' | 'outlook', authCode: string): Observable<IntegrationResponse> {
    return this.http.post<IntegrationResponse>(
      `${this.base}/api/dashboard/integration/calendar`,
      { calendarType, authCode },
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Video Conference Integration
  connectVideoConference(zoomAuthCode: string): Observable<IntegrationResponse> {
    return this.http.post<IntegrationResponse>(
      `${this.base}/api/dashboard/integration/video-conference/zoom`,
      { zoomAuthCode },
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Document Verification
  uploadDocuments(files: File[]): Observable<IntegrationResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<IntegrationResponse>(
      `${this.base}/api/dashboard/integration/documents`,
      formData,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
