import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  techStack = [
    {
      category: 'AI / ML',
      icon: '🤖',
      items: [
        'HuggingFace Transformers',
        'RoBERTa Model',
        'DistilRoBERTa',
        'PyTorch',
      ],
    },
    {
      category: 'Backend 1',
      icon: '🐍',
      items: [
        'Django 4.x',
        'Django REST Framework',
        'SimpleJWT',
        'Celery + Redis',
      ],
    },
    {
      category: 'Backend 2',
      icon: '⚡',
      items: ['Node.js', 'Express.js', 'Socket.IO', 'MongoDB'],
    },
    {
      category: 'Frontend',
      icon: '🅰️',
      items: ['Angular 19', 'TypeScript', 'SCSS', 'Chart.js'],
    },
    {
      category: 'Database',
      icon: '🗄️',
      items: ['PostgreSQL', 'MongoDB', 'Redis'],
    },
    {
      category: 'DevOps',
      icon: '🐳',
      items: ['Docker', 'GitHub Actions', 'Render', 'Vercel'],
    },
  ];

  models = [
    {
      name: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      task: 'Sentiment Analysis',
      accuracy: '98%+',
      desc: 'Fine-tuned RoBERTa model trained on 124M tweets. Detects positive, negative, and neutral sentiment with industry-leading accuracy.',
    },
    {
      name: 'j-hartmann/emotion-english-distilroberta-base',
      task: 'Emotion Detection',
      accuracy: '95%+',
      desc: 'DistilRoBERTa model that classifies text into 7 emotion categories: joy, anger, fear, sadness, surprise, disgust, and neutral.',
    },
  ];

  timeline = [
    {
      day: 'Day 1',
      title: 'Django Setup',
      desc: 'Project skeleton, PostgreSQL, virtual environment',
    },
    {
      day: 'Day 2',
      title: 'JWT Auth API',
      desc: 'Signup, login, logout, profile endpoints',
    },
    {
      day: 'Day 3',
      title: 'AI Model Integration',
      desc: 'HuggingFace RoBERTa sentiment + emotion model',
    },
    {
      day: 'Day 4',
      title: 'Node.js + Socket.IO',
      desc: 'Real-time feed, MongoDB, WebSocket connection',
    },
    {
      day: 'Day 5',
      title: 'Angular Dashboard',
      desc: 'Live analysis UI, history, stats',
    },
    {
      day: 'Day 6+',
      title: 'Enhancement',
      desc: 'Home page, about, contact, charts, animations',
    },
  ];
}
