import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  isDark$ = this.isDarkSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    this.isDarkSubject.next(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const newVal = !this.isDarkSubject.value;
    this.isDarkSubject.next(newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
    this.applyTheme(newVal);
  }

  get isDark(): boolean {
    return this.isDarkSubject.value;
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
