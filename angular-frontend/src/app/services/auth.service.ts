import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/accounts';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private autoLogoutTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Agar pehle se logged in hai toh timer shuru karo
    if (this.hasToken()) {
      this.scheduleAutoLogout(55 * 60 * 1000); // 55 minutes
    }
  }

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
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
      this.autoLogoutTimer = null;
    }
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/home']);
  }

  private saveTokens(res: any): void {
    localStorage.setItem('access_token', res.tokens.access);
    localStorage.setItem('refresh_token', res.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.isLoggedInSubject.next(true);
    this.scheduleAutoLogout(55 * 60 * 1000); // 55 min
  }

  private scheduleAutoLogout(duration: number): void {
    if (this.autoLogoutTimer) clearTimeout(this.autoLogoutTimer);
    this.autoLogoutTimer = setTimeout(() => {
      alert('⏰ Session expired! Please login again.');
      this.logout();
    }, duration);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/`, data).pipe(
      tap(() => {
        const current = this.getUser();
        const updated = { ...current, ...data };
        localStorage.setItem('user', JSON.stringify(updated));
      }),
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/`);
  }
}
