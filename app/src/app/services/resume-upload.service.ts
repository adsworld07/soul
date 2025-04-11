import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResumeUploadService {

  public url: string;

  constructor(private http: HttpClient) {
    let base;
    if (!location.toString().includes('localhost')) {
      base = 'https://hiyrnow.in/backend/api';
    } else {
      base = 'http://localhost:5500/api';
    }
    this.url = base;
  }

  downloadPDF(filename: string): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(`${this.url}/file/${filename}`, {
      responseType: 'blob',
      headers: headers,
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  showFileNames(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(`${this.url}/files`, {
      headers: headers,
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/upload`, formData, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }
   // Method to trigger resume parsing after upload
   parseResume(): Observable<any> {
    // console.log("£££££££££££££££££££££££££")
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(`${this.url}/parse-resume`, {
      headers: headers,
      withCredentials: true
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
}
