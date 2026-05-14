import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/accounts';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  signup(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/signup/`, data)
      .pipe(tap((res: any) => this.saveTokens(res)));
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login/`, { email, password })
      .pipe(tap((res: any) => this.saveTokens(res)));
  }

  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${this.apiUrl}/logout/`, { refresh }).subscribe();
    }
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  private saveTokens(res: any): void {
    localStorage.setItem('access_token', res.tokens.access);
    localStorage.setItem('refresh_token', res.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.isLoggedInSubject.next(true);

    // Auto logout — 55 minutes baad (token 1 hour mein expire hota hai)
    this.scheduleAutoLogout(55 * 60 * 1000);
  }

  private autoLogoutTimer: any = null;

  scheduleAutoLogout(duration: number): void {
    // Pehla timer clear karo agar chal raha ho
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }

    this.autoLogoutTimer = setTimeout(() => {
      alert('⏰ Session expired! Please login again.');
      this.logout();
    }, duration);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/`);
  }
}
