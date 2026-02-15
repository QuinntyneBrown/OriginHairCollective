import { Component, inject, OnInit, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ContentService } from 'api';
import type { FaqItem } from 'api';

@Component({
  selector: 'feat-faq-list',
  standalone: true,
  imports: [KeyValuePipe],
  template: `
    @for (entry of groupedFaqs | keyvalue; track entry.key) {
      <div class="faq-list__category">
        <h2 class="faq-list__category-title">{{ entry.key }}</h2>
        @for (item of entry.value; track item.id) {
          <div class="faq-list__item" [class.expanded]="isExpanded(item.id)">
            <button class="faq-list__question" (click)="toggle(item.id)">
              {{ item.question }}
              <span class="faq-list__toggle">{{ isExpanded(item.id) ? '-' : '+' }}</span>
            </button>
            @if (isExpanded(item.id)) {
              <p class="faq-list__answer">{{ item.answer }}</p>
            }
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 40px; }
    .faq-list {
      &__category { display: flex; flex-direction: column; gap: 12px; }
      &__category-title { font-family: var(--font-heading); font-size: 24px; font-weight: 500; color: var(--color-gold); }
      &__item {
        border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden;
        &.expanded { border-color: var(--color-gold-border); }
      }
      &__question {
        display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 20px 24px;
        background: var(--color-bg-secondary); border: none; cursor: pointer;
        font-family: var(--font-body); font-size: 16px; font-weight: 500; color: var(--color-text-primary); text-align: left;
      }
      &__toggle { font-size: 20px; color: var(--color-gold); flex-shrink: 0; margin-left: 16px; }
      &__answer {
        padding: 0 24px 20px; font-family: var(--font-body); font-size: 15px; line-height: 1.7; color: var(--color-text-secondary);
      }
    }
  `,
})
export class FaqListComponent implements OnInit {
  private readonly contentService = inject(ContentService);

  readonly faqs = signal<FaqItem[]>([]);
  readonly expandedIds = signal<Set<string>>(new Set());

  get groupedFaqs(): Map<string, FaqItem[]> {
    const map = new Map<string, FaqItem[]>();
    for (const faq of this.faqs()) {
      const group = map.get(faq.category) ?? [];
      group.push(faq);
      map.set(faq.category, group);
    }
    return map;
  }

  ngOnInit(): void {
    this.contentService.getFaqs().subscribe({
      next: (faqs) => this.faqs.set(faqs),
    });
  }

  toggle(id: string): void {
    this.expandedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }
}
