import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { SentimentService } from '../services/sentiment.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  allItems: any[] = [];
  filteredItems: any[] = [];
  isLoading = true;
  searchText = '';
  selectedSentiment = 'all';
  selectedEmotion = 'all';
  deleteId: number | null = null;

  emotions = [
    'all',
    'joy',
    'anger',
    'fear',
    'sadness',
    'surprise',
    'disgust',
    'neutral',
  ];
  sentiments = ['all', 'positive', 'negative', 'neutral'];

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

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.sentimentService.getHistory().subscribe({
      next: (res: any) => {
        this.allItems = res.results || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredItems = this.allItems.filter((item) => {
      const matchSearch =
        !this.searchText ||
        item.text.toLowerCase().includes(this.searchText.toLowerCase());
      const matchSentiment =
        this.selectedSentiment === 'all' ||
        item.sentiment_label === this.selectedSentiment;
      const matchEmotion =
        this.selectedEmotion === 'all' ||
        item.dominant_emotion === this.selectedEmotion;
      return matchSearch && matchSentiment && matchEmotion;
    });
  }

  deleteItem(id: number): void {
    this.sentimentService.deleteAnalysis(id).subscribe({
      next: () => {
        this.allItems = this.allItems.filter((i) => i.id !== id);
        this.applyFilters();
        this.deleteId = null;
      },
    });
  }

  exportCSV(): void {
    const headers = [
      'Text',
      'Sentiment',
      'Score',
      'Emotion',
      'Emotion Score',
      'Date',
    ];
    const rows = this.filteredItems.map((i) => [
      `"${i.text.replace(/"/g, '""')}"`,
      i.sentiment_label,
      (i.sentiment_score * 100).toFixed(1) + '%',
      i.dominant_emotion,
      (i.emotion_score * 100).toFixed(1) + '%',
      new Date(i.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentiosync-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedSentiment = 'all';
    this.selectedEmotion = 'all';
    this.applyFilters();
  }
}
