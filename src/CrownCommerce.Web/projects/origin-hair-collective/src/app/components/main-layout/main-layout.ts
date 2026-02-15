import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  ButtonComponent,
  CloseButtonComponent,
  FooterLinkColumnComponent,
  SocialIconsComponent,
  LogoComponent,
  DividerComponent,
} from 'components';
import type { FooterLink, SocialLink } from 'components';
import { ChatContainerComponent } from 'features';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    ButtonComponent,
    CloseButtonComponent,
    FooterLinkColumnComponent,
    SocialIconsComponent,
    LogoComponent,
    DividerComponent,
    ChatContainerComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly router = inject(Router);

  mobileMenuOpen = false;

  readonly navLinks = [
    { label: 'Collection', href: '/shop' },
    { label: 'Our Story', href: '/about' },
    { label: 'Hair Care', href: '/hair-care-guide' },
    { label: 'Wholesale', href: '/wholesale' },
  ];

  readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/originhairco' },
    { platform: 'tiktok', href: 'https://tiktok.com/@originhairco' },
    { platform: 'email', href: 'mailto:hello@originhairco.ca' },
  ];

  readonly shopLinks: FooterLink[] = [
    { label: 'Bundles', href: '/shop', queryParams: { category: 'bundles' } },
    { label: 'Closures', href: '/shop', queryParams: { category: 'closures' } },
    { label: 'Frontals', href: '/shop', queryParams: { category: 'frontals' } },
    { label: 'Bundle Deals', href: '/shop', queryParams: { category: 'deals' } },
  ];

  readonly companyLinks: FooterLink[] = [
    { label: 'Our Story', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'Ambassador Program', href: '/ambassador' },
  ];

  readonly supportLinks: FooterLink[] = [
    { label: 'Hair Care Guide', href: '/hair-care-guide' },
    { label: 'Shipping Info', href: '/shipping-info' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateToShop(): void {
    this.router.navigate(['/shop']);
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }
}
