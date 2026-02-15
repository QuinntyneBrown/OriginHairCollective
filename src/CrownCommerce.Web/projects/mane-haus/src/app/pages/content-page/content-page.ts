import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ContentService } from 'api';
import type { ContentPage } from 'api';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';

const ROUTE_TO_SLUG: Record<string, string> = {
  'our-story': 'our-story',
  'hair-care': 'hair-care-guide',
  'shipping': 'shipping-information',
  'returns': 'returns-policy',
  'ambassador': 'ambassador-program',
};

const ROUTE_TO_TITLE: Record<string, string> = {
  'our-story': 'Our Story',
  'hair-care': 'Hair Care Guide',
  'shipping': 'Shipping Info',
  'returns': 'Returns & Exchanges',
  'ambassador': 'Ambassador Program',
};

@Component({
  selector: 'app-content-page',
  imports: [LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss',
})
export class ContentPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);

  readonly page = signal<ContentPage | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  private currentSlug = '';

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const path = segments.map(s => s.path).join('/');
      const slug = ROUTE_TO_SLUG[path];
      const pageTitle = ROUTE_TO_TITLE[path] || path;
      this.titleService.setTitle(`${pageTitle} | Mane Haus`);
      this.meta.updateTag({ name: 'description', content: `${pageTitle} - Mane Haus` });

      if (slug) {
        this.currentSlug = slug;
        this.loadPage(slug);
      } else {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  loadPage(slug?: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.contentService.getPage(slug ?? this.currentSlug).subscribe({
      next: (page) => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
