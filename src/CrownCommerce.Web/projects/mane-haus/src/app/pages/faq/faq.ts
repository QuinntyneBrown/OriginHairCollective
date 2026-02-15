import { Component, inject, OnInit, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SectionHeaderComponent } from 'components';
import { ContentService } from 'api';
import type { FaqItem } from 'api';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';

@Component({
  selector: 'app-faq',
  imports: [SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class FaqPage implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly faqs = signal<FaqItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly activeCategory = signal('all');
  readonly expandedId = signal<string | null>(null);

  readonly categories = ['all', 'General', 'Products', 'Orders'];

  ngOnInit(): void {
    this.title.setTitle('FAQ | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Frequently asked questions about Mane Haus products, orders, and shipping.' });
    this.loadFaqs();
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
    if (category === 'all') {
      this.loadFaqs();
    } else {
      this.loading.set(true);
      this.contentService.getFaqsByCategory(category).subscribe({
        next: (faqs) => {
          this.faqs.set(faqs);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
    }
  }

  toggleFaq(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  loadFaqs(): void {
    this.loading.set(true);
    this.error.set(false);
    this.contentService.getFaqs().subscribe({
      next: (faqs) => {
        this.faqs.set(faqs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
