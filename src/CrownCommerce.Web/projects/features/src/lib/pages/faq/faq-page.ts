import { Component, inject, OnInit, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { SectionHeaderComponent } from 'components';
import { ContentService } from 'api';
import type { FaqItem } from 'api';

@Component({
  selector: 'feat-faq-page',
  standalone: true,
  imports: [KeyValuePipe, SectionHeaderComponent],
  templateUrl: './faq-page.html',
  styleUrl: './faq-page.scss',
})
export class FaqPage implements OnInit {
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
