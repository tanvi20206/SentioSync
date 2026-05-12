import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SentimentService {
  private djangoUrl = 'http://localhost:8000/api/sentiment';
  private nodeUrl = 'http://localhost:3000/api/feed';

  constructor(private http: HttpClient) {}

  analyseText(text: string): Observable<any> {
    return this.http.post(`${this.djangoUrl}/analyse/`, { text });
  }

  getHistory(): Observable<any> {
    return this.http.get(`${this.djangoUrl}/history/`);
  }

  deleteAnalysis(id: number): Observable<any> {
    return this.http.delete(`${this.djangoUrl}/history/${id}/`);
  }

  addToFeed(text: string): Observable<any> {
    return this.http.post(`${this.nodeUrl}/add`, { text });
  }

  getFeed(): Observable<any> {
    return this.http.get(`${this.nodeUrl}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.nodeUrl}/stats`);
  }
}
