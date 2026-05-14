import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { SentimentService } from '../services/sentiment.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('demoText') demoTextRef!: ElementRef;

  typewriterText = '';
  phrases = [
    'Understand Emotions.',
    'Analyse Sentiment.',
    'Read Between Lines.',
    'Decode Feelings.',
  ];
  currentPhrase = 0;
  particles: any[] = [];

  demoInput = "I absolutely love this new AI feature! It's amazing!";
  demoResult: any = null;
  isDemoLoading = false;

  features = [
    {
      icon: '🤖',
      title: 'RoBERTa AI Model',
      desc: 'State-of-the-art transformer model with 98%+ accuracy on sentiment detection.',
    },
    {
      icon: '⚡',
      title: 'Real-time Analysis',
      desc: 'Instant results powered by WebSocket connections and async processing.',
    },
    {
      icon: '😊',
      title: '7 Emotion Detection',
      desc: 'Joy, Anger, Fear, Sadness, Surprise, Disgust, Neutral — all detected.',
    },
    {
      icon: '📊',
      title: 'Beautiful Charts',
      desc: 'Interactive donut charts, radar graphs, and live emotion timelines.',
    },
    {
      icon: '📁',
      title: 'Bulk CSV Upload',
      desc: 'Analyse thousands of texts at once with our batch processing engine.',
    },
    {
      icon: '🔐',
      title: 'Secure & Private',
      desc: 'JWT authentication ensures your data stays yours — always encrypted.',
    },
  ];

  stats: { value: number; suffix: string; label: string; display: number }[] = [
    { value: 98, suffix: '%', label: 'Accuracy', display: 0 },
    { value: 7, suffix: '+', label: 'Emotions Detected', display: 0 },
    { value: 2, suffix: 'ms', label: 'Response Time', display: 0 },
    { value: 100, suffix: '%', label: 'Open Source', display: 0 },
  ];
  constructor(private sentimentService: SentimentService) {}

  ngOnInit(): void {
    this.generateParticles();
    this.startTypewriter();
    this.animateStats();
  }

  generateParticles(): void {
    const emojis = ['😊', '😠', '😢', '😨', '😲', '🤢', '😐', '❤️', '⚡', '🧠'];
    this.particles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 1.2 + Math.random() * 1.2,
    }));
  }

  startTypewriter(): void {
    const type = (text: string, i: number) => {
      if (i <= text.length) {
        this.typewriterText = text.slice(0, i);
        setTimeout(() => type(text, i + 1), 80);
      } else {
        setTimeout(() => erase(text, text.length), 1800);
      }
    };
    const erase = (text: string, i: number) => {
      if (i >= 0) {
        this.typewriterText = text.slice(0, i);
        setTimeout(() => erase(text, i - 1), 40);
      } else {
        this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
        setTimeout(() => type(this.phrases[this.currentPhrase], 0), 400);
      }
    };
    type(this.phrases[0], 0);
  }

  animateStats(): void {
    this.stats = this.stats.map((s) => ({ ...s, display: 0 }));
    setTimeout(() => {
      this.stats.forEach((stat, idx) => {
        let start = 0;
        const step = Math.ceil(stat.value / 40);
        const interval = setInterval(() => {
          start = Math.min(start + step, stat.value);
          this.stats[idx] = { ...stat, display: start };
          if (start >= stat.value) clearInterval(interval);
        }, 30);
      });
    }, 600);
  }

  runDemo(): void {
    if (!this.demoInput.trim() || this.isDemoLoading) return;
    this.isDemoLoading = true;
    this.demoResult = null;
    this.sentimentService.analyseText(this.demoInput).subscribe({
      next: (res: any) => {
        this.demoResult = res.result;
        this.isDemoLoading = false;
      },
      error: () => {
        this.isDemoLoading = false;
      },
    });
  }

  getSentimentColor(label: string): string {
    const map: any = {
      positive: '#22c55e',
      negative: '#ef4444',
      neutral: '#94a3b8',
    };
    return map[label] || '#667eea';
  }

  getEmotionEmoji(e: string): string {
    const map: any = {
      joy: '😊',
      anger: '😠',
      fear: '😨',
      sadness: '😢',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐',
    };
    return map[e] || '🤔';
  }
}
