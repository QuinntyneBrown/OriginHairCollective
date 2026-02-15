import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import {
  ButtonComponent,
  BadgeComponent,
  SectionHeaderComponent,
  TrustBarItemComponent,
  ProductCardComponent,
  BenefitCardComponent,
  TestimonialCardComponent,
  DividerComponent,
} from 'components';
import { CatalogService, ContentService } from 'api';
import type { HairProduct, Testimonial, GalleryImage } from 'api';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';
import { NewsletterSignupComponent } from '../../components/newsletter-signup/newsletter-signup';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    ButtonComponent,
    BadgeComponent,
    SectionHeaderComponent,
    TrustBarItemComponent,
    ProductCardComponent,
    BenefitCardComponent,
    TestimonialCardComponent,
    DividerComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    NewsletterSignupComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly contentService = inject(ContentService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly products = signal<HairProduct[]>([]);
  readonly productsLoading = signal(true);
  readonly productsError = signal(false);

  readonly testimonials = signal<Testimonial[]>([]);
  readonly testimonialsLoading = signal(true);
  readonly testimonialsError = signal(false);

  readonly galleryImages = signal<GalleryImage[]>([]);
  readonly galleryLoading = signal(true);
  readonly galleryError = signal(false);

  readonly gemIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`;

  readonly timerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>`;

  readonly heartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;

  readonly trustItems = [
    {
      text: 'Authentic',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
    },
    {
      text: 'Free Shipping',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
    },
    {
      text: '5-Star Rated',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`,
    },
  ];

  ngOnInit(): void {
    this.title.setTitle('Mane Haus | Premium Hair Extensions');
    this.meta.updateTag({ name: 'description', content: 'Mane Haus - Luxury virgin hair extensions, bundles, closures, and frontals. Based in Toronto, serving Canada and beyond.' });

    this.loadProducts();
    this.loadTestimonials();
    this.loadGallery();
  }

  formatPrice(price: number): string {
    return `FROM $${price}`;
  }

  loadProducts(): void {
    this.productsLoading.set(true);
    this.productsError.set(false);
    this.catalogService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.productsLoading.set(false);
      },
      error: () => {
        this.productsError.set(true);
        this.productsLoading.set(false);
      },
    });
  }

  loadTestimonials(): void {
    this.testimonialsLoading.set(true);
    this.testimonialsError.set(false);
    this.contentService.getTestimonials().subscribe({
      next: (testimonials) => {
        this.testimonials.set(testimonials);
        this.testimonialsLoading.set(false);
      },
      error: () => {
        this.testimonialsError.set(true);
        this.testimonialsLoading.set(false);
      },
    });
  }

  loadGallery(): void {
    this.galleryLoading.set(true);
    this.galleryError.set(false);
    this.contentService.getGalleryByCategory('community').subscribe({
      next: (images) => {
        this.galleryImages.set(images);
        this.galleryLoading.set(false);
      },
      error: () => {
        this.galleryError.set(true);
        this.galleryLoading.set(false);
      },
    });
  }
}
