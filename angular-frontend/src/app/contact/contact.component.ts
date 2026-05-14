import { Component } from '@angular/core';
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

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitted = false;
  isLoading = false;

  faqs = [
    {
      q: 'Is SentioSync free to use?',
      a: 'Yes! SentioSync is completely free — sign up and start analysing text instantly.',
      open: false,
    },
    {
      q: 'Which AI models are used?',
      a: 'We use RoBERTa for sentiment analysis and DistilRoBERTa for emotion detection — both from HuggingFace.',
      open: false,
    },
    {
      q: 'How accurate is the sentiment detection?',
      a: 'Our RoBERTa model achieves 98%+ accuracy on standard sentiment benchmarks.',
      open: false,
    },
    {
      q: 'Can I analyse multiple texts at once?',
      a: 'Yes! Use the CSV upload feature on the History page to bulk-analyse thousands of texts.',
      open: false,
    },
    {
      q: 'Is my data secure?',
      a: 'Yes — all data is protected with JWT authentication and encrypted connections.',
      open: false,
    },
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = true;
      this.contactForm.reset();
    }, 1500);
  }
}
