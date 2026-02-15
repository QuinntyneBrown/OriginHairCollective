import { InjectionToken } from '@angular/core';

export interface HomePageConfig {
  heroTitle: string;
  heroSubtitle: string;
  showGallerySection: boolean;
  showBenefitsSection: boolean;
  featuredProductCount: number;
  newsletterTags: string[];
}

export const HOME_PAGE_CONFIG = new InjectionToken<HomePageConfig>('HOME_PAGE_CONFIG');
