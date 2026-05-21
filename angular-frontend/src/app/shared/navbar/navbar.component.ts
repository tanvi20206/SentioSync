import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isLoggedIn = false;
  user: any = null;
  isDark = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((val) => {
      this.isLoggedIn = val;
      this.user = this.authService.getUser();
    });
    this.themeService.isDark$.subscribe((val) => {
      this.isDark = val;
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  toggleMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  getInitials(): string {
    return this.user?.username?.slice(0, 2).toUpperCase() || 'U';
  }

  logout(): void {
    this.isProfileMenuOpen = false;
    this.authService.logout();
  }
}
