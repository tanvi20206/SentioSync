import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { SentimentService } from '../services/sentiment.service';
import gsap from 'gsap';

interface Message {
  date: string;
  time: string;
  sender: string;
  text: string;
  sentiment?: string;
  emotion?: string;
  sentimentScore?: number;
  emotionScore?: number;
  allScores?: any;
}

interface PersonStats {
  name: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  topEmotion: string;
  messages: Message[];
}

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss'],
})
export class WhatsappComponent {
  // States
  step: 'upload' | 'analysing' | 'results' = 'upload';
  isDragging = false;
  fileName = '';
  errorMsg = '';

  // Data
  messages: Message[] = [];
  analysedMessages: Message[] = [];
  personStats: PersonStats[] = [];
  overallStats = {
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    topEmotion: '',
  };
  mostPositive: Message | null = null;
  mostNegative: Message | null = null;

  // Progress
  progress = 0;
  analysedCount = 0;
  totalToAnalyse = 0;

  emotionEmoji: any = {
    joy: '😊',
    anger: '😠',
    fear: '😨',
    sadness: '😢',
    surprise: '😲',
    disgust: '🤢',
    neutral: '😐',
  };
  sentimentColor: any = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#94a3b8',
  };

  constructor(private sentimentService: SentimentService) {}

  // ─── File Handling ──────────────────────────────────────────────
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = true;
  }
  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelect(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  processFile(file: File): void {
    if (!file.name.endsWith('.txt')) {
      this.errorMsg = 'Please upload a .txt file exported from WhatsApp';
      return;
    }
    this.fileName = file.name;
    this.errorMsg = '';
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.parseWhatsAppChat(content);
    };
    reader.readAsText(file);
  }

  // ─── Parse WhatsApp Export ──────────────────────────────────────
  parseWhatsAppChat(content: string): void {
    const lines = content.split('\n');
    const messages: Message[] = [];

    // WhatsApp format: "DD/MM/YYYY, HH:MM - Sender: Message"
    // Also handles: "MM/DD/YY, HH:MM AM/PM - Sender: Message"
    const regex =
      /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?:\s?[AP]M)?)\s*-\s*([^:]+):\s*(.+)$/;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        const text = match[4].trim();
        // Skip system messages
        if (
          text.includes('Messages and calls are end-to-end encrypted') ||
          text.includes('joined using this group') ||
          text.includes('added') ||
          text.includes('left') ||
          text === '<Media omitted>' ||
          text === 'null' ||
          text.length < 2
        )
          continue;

        messages.push({
          date: match[1],
          time: match[2],
          sender: match[3].trim(),
          text: text,
        });
      }
    }

    if (messages.length === 0) {
      this.errorMsg =
        'No messages found. Make sure you exported the chat correctly from WhatsApp.';
      return;
    }

    // Limit to 50 messages for speed
    this.messages = messages.slice(0, 50);
    this.startAnalysis();
  }

  // ─── Analysis ───────────────────────────────────────────────────
  async startAnalysis(): Promise<void> {
    this.step = 'analysing';
    this.progress = 0;
    this.analysedCount = 0;
    this.totalToAnalyse = this.messages.length;
    this.analysedMessages = [];

    for (let i = 0; i < this.messages.length; i++) {
      const msg = { ...this.messages[i] };

      await new Promise<void>((resolve) => {
        this.sentimentService.analyseText(msg.text).subscribe({
          next: (res: any) => {
            msg.sentiment = res.result.sentiment_label;
            msg.sentimentScore = res.result.sentiment_score;
            msg.emotion = res.result.dominant_emotion;
            msg.emotionScore = res.result.emotion_score;
            msg.allScores = res.result.sentiment_all_scores;
            this.analysedMessages.push(msg);
            this.analysedCount = i + 1;
            this.progress = Math.round(((i + 1) / this.totalToAnalyse) * 100);
            resolve();
          },
          error: () => {
            msg.sentiment = 'neutral';
            msg.emotion = 'neutral';
            msg.sentimentScore = 0.5;
            this.analysedMessages.push(msg);
            this.analysedCount = i + 1;
            this.progress = Math.round(((i + 1) / this.totalToAnalyse) * 100);
            resolve();
          },
        });
      });

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 300));
    }

    this.computeStats();
    this.step = 'results';
    setTimeout(() => this.animateResults(), 100);
  }

  // ─── Compute Stats ───────────────────────────────────────────────
  computeStats(): void {
    const senders = [...new Set(this.analysedMessages.map((m) => m.sender))];
    const emotionCount: any = {};

    this.overallStats = {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      topEmotion: '',
    };

    this.personStats = senders.map((sender) => {
      const msgs = this.analysedMessages.filter((m) => m.sender === sender);
      const stats: PersonStats = {
        name: sender,
        total: msgs.length,
        positive: msgs.filter((m) => m.sentiment === 'positive').length,
        negative: msgs.filter((m) => m.sentiment === 'negative').length,
        neutral: msgs.filter((m) => m.sentiment === 'neutral').length,
        topEmotion: '',
        messages: msgs,
      };

      // Top emotion for person
      const emo: any = {};
      msgs.forEach((m) => {
        if (m.emotion) emo[m.emotion] = (emo[m.emotion] || 0) + 1;
      });
      if (Object.keys(emo).length > 0) {
        stats.topEmotion = Object.entries(emo).sort(
          (a: any, b: any) => b[1] - a[1],
        )[0][0];
      }

      // Overall
      this.overallStats.total += stats.total;
      this.overallStats.positive += stats.positive;
      this.overallStats.negative += stats.negative;
      this.overallStats.neutral += stats.neutral;

      // Emotion count overall
      msgs.forEach((m) => {
        if (m.emotion)
          emotionCount[m.emotion] = (emotionCount[m.emotion] || 0) + 1;
      });

      return stats;
    });

    // Top overall emotion
    if (Object.keys(emotionCount).length > 0) {
      this.overallStats.topEmotion = Object.entries(emotionCount).sort(
        (a: any, b: any) => b[1] - a[1],
      )[0][0];
    }

    // Most positive & negative
    const sorted = [...this.analysedMessages].sort(
      (a, b) => (b.sentimentScore || 0) - (a.sentimentScore || 0),
    );
    this.mostPositive = sorted.find((m) => m.sentiment === 'positive') || null;
    this.mostNegative =
      [...this.analysedMessages]
        .sort((a, b) => (b.sentimentScore || 0) - (a.sentimentScore || 0))
        .find((m) => m.sentiment === 'negative') || null;
  }

  // ─── GSAP Animations ─────────────────────────────────────────────
  animateResults(): void {
    gsap.from('.result-hero', {
      duration: 0.6,
      y: -20,
      opacity: 0,
      ease: 'power2.out',
    });
    gsap.from('.overall-card', {
      duration: 0.5,
      scale: 0.95,
      opacity: 0,
      stagger: 0.1,
      delay: 0.2,
    });
    gsap.from('.person-card', {
      duration: 0.5,
      y: 30,
      opacity: 0,
      stagger: 0.15,
      delay: 0.4,
    });
    gsap.from('.highlight-card', {
      duration: 0.5,
      x: -20,
      opacity: 0,
      stagger: 0.1,
      delay: 0.6,
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  getPercent(val: number, total: number): number {
    return total ? Math.round((val / total) * 100) : 0;
  }

  reset(): void {
    this.step = 'upload';
    this.messages = [];
    this.analysedMessages = [];
    this.personStats = [];
    this.fileName = '';
    this.progress = 0;
  }

  exportResults(): void {
    const headers = [
      'Sender',
      'Date',
      'Time',
      'Message',
      'Sentiment',
      'Score',
      'Emotion',
    ];
    const rows = this.analysedMessages.map((m) => [
      m.sender,
      m.date,
      m.time,
      `"${m.text.replace(/"/g, '""')}"`,
      m.sentiment,
      ((m.sentimentScore || 0) * 100).toFixed(1) + '%',
      m.emotion,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsapp-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
