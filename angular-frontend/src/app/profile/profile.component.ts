import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { AuthService } from '../services/auth.service';
import { SentimentService } from '../services/sentiment.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  profileForm: FormGroup;
  isEditing = false;
  isSaving = false;
  saveSuccess = false;
  stats: any = {
    total: 0,
    sentiment: { positive: 0, negative: 0, neutral: 0 },
    emotions: {},
  };
  topEmotion = '';

  emotionMap: any = {
    joy: { emoji: '😊', label: 'Joyful Soul', color: '#f59e0b' },
    anger: { emoji: '😠', label: 'Fierce Mind', color: '#ef4444' },
    fear: { emoji: '😨', label: 'Deep Thinker', color: '#8b5cf6' },
    sadness: { emoji: '😢', label: 'Empathetic Heart', color: '#3b82f6' },
    surprise: { emoji: '😲', label: 'Curious Spirit', color: '#22c55e' },
    disgust: { emoji: '🤢', label: 'Sharp Critic', color: '#14b8a6' },
    neutral: { emoji: '😐', label: 'Calm Observer', color: '#94a3b8' },
  };

  constructor(
    private authService: AuthService,
    private sentimentService: SentimentService,
    private fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      bio: [''],
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.profileForm.patchValue({
      username: this.user?.username || '',
      bio: this.user?.bio || '',
    });
    this.loadStats();
  }

  loadStats(): void {
    this.sentimentService.getHistory().subscribe({
      next: (res: any) => {
        const results = res.results || [];
        const stats: any = {
          total: results.length,
          sentiment: { positive: 0, negative: 0, neutral: 0 },
          emotions: {},
        };
        results.forEach((item: any) => {
          if (item.sentiment_label) stats.sentiment[item.sentiment_label]++;
          if (item.dominant_emotion)
            stats.emotions[item.dominant_emotion] =
              (stats.emotions[item.dominant_emotion] || 0) + 1;
        });
        this.stats = stats;
        if (Object.keys(stats.emotions).length > 0) {
          this.topEmotion = Object.entries(stats.emotions).sort(
            (a: any, b: any) => b[1] - a[1],
          )[0][0];
        }
      },
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.saveSuccess = false;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;

    // Django API se profile update karo
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res: any) => {
        const updated = { ...this.user, ...this.profileForm.value };
        localStorage.setItem('user', JSON.stringify(updated));
        this.user = updated;
        this.isSaving = false;
        this.isEditing = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: () => {
        // API fail ho toh bhi localStorage mein save karo
        const updated = { ...this.user, ...this.profileForm.value };
        localStorage.setItem('user', JSON.stringify(updated));
        this.user = updated;
        this.isSaving = false;
        this.isEditing = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
    });
  }

  getInitials(): string {
    return this.user?.username?.slice(0, 2).toUpperCase() || 'U';
  }
  getEmotionColor(): string {
    return this.emotionMap[this.topEmotion]?.color || '#667eea';
  }
  getEmotionEmoji(): string {
    return this.emotionMap[this.topEmotion]?.emoji || '🧠';
  }
  getEmotionLabel(): string {
    return this.emotionMap[this.topEmotion]?.label || 'Analyst';
  }
  getSentimentPercent(type: string): number {
    if (!this.stats.total) return 0;
    return Math.round((this.stats.sentiment[type] / this.stats.total) * 100);
  }
  logout(): void {
    this.authService.logout();
  }
}
