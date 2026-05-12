import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    if (this.authService.hasToken()) this.router.navigate(['/dashboard']);
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;
    const { password, password2 } = this.signupForm.value;
    if (password !== password2) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.signup(this.signupForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = JSON.stringify(err.error) || 'Signup failed.';
        this.isLoading = false;
      },
    });
  }
}
