import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SentimentService } from '../../services/sentiment.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  inputText = '';
  isAnalysing = false;
  currentResult: any = null;
  history: any[] = [];
  feedItems: any[] = [];
  isMockFeedRunning = false;
  stats: any = {
    total: 0,
    sentiment: { positive: 0, negative: 0, neutral: 0 },
    emotions: {},
  };

  constructor(
    private authService: AuthService,
    private sentimentService: SentimentService,
    private socketService: SocketService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = this.authService.getUser();
    this.loadHistory();
    this.loadStats();
    this.setupSocket();
  }

  setupSocket(): void {
    this.socketService.connect();
    if (this.user) this.socketService.joinRoom(String(this.user.id));
    this.socketService.onNewFeedItem().subscribe((item: any) => {
      this.feedItems.unshift({ ...item, analysing: true });
      this.sentimentService.analyseText(item.text).subscribe({
        next: (res: any) => {
          this.feedItems[0] = {
            ...this.feedItems[0],
            result: res.result,
            analysing: false,
          };
          this.loadStats();
        },
        error: () => {
          this.feedItems[0].analysing = false;
        },
      });
    });
  }

  analyseText(): void {
    if (!this.inputText.trim()) return;
    this.isAnalysing = true;
    this.currentResult = null;
    this.sentimentService.analyseText(this.inputText).subscribe({
      next: (res: any) => {
        this.currentResult = res.result;
        this.isAnalysing = false;
        this.loadHistory();
        this.loadStats();
      },
      error: () => {
        this.isAnalysing = false;
      },
    });
  }

  loadHistory(): void {
    this.sentimentService.getHistory().subscribe({
      next: (res: any) => {
        this.history = res.results?.slice(0, 5) || [];
      },
    });
  }
  loadStats(): void {
    this.sentimentService.getHistory().subscribe({
      next: (res: any) => {
        const results = res.results || [];
        const stats = {
          total: results.length,
          sentiment: { positive: 0, negative: 0, neutral: 0 },
          emotions: {} as any,
        };
        results.forEach((item: any) => {
          if (item.sentiment_label) {
            stats.sentiment[
              item.sentiment_label as 'positive' | 'negative' | 'neutral'
            ]++;
          }
          if (item.dominant_emotion) {
            stats.emotions[item.dominant_emotion] =
              (stats.emotions[item.dominant_emotion] || 0) + 1;
          }
        });
        this.stats = stats;
      },
      error: () => {},
    });
  }

  toggleMockFeed(): void {
    if (this.isMockFeedRunning) {
      this.socketService.stopMockFeed();
      this.isMockFeedRunning = false;
    } else {
      this.socketService.startMockFeed(String(this.user?.id));
      this.isMockFeedRunning = true;
    }
  }

  getEmotionEmoji(emotion: string): string {
    const map: any = {
      joy: '😊',
      anger: '😠',
      fear: '😨',
      sadness: '😢',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐',
    };
    return map[emotion] || '🤔';
  }

  getSentimentColor(label: string): string {
    const map: any = {
      positive: '#4ade80',
      negative: '#f87171',
      neutral: '#94a3b8',
    };
    return map[label] || '#fff';
  }

  logout(): void {
    this.authService.logout();
  }
  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
