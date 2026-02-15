import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
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
  readonly cartService = inject(CartService);

  mobileMenuOpen = false;
  currentYear = new Date().getFullYear();

  readonly navLinks = [
    { label: 'Collection', href: '/collection' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Hair Care', href: '/hair-care' },
    { label: 'Contact', href: '/contact' },
  ];

  readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/manehaus' },
    { platform: 'tiktok', href: 'https://tiktok.com/@manehaus' },
    { platform: 'email', href: 'mailto:hello@manehaus.ca' },
  ];

  readonly shopLinks: FooterLink[] = [
    { label: 'Bundles', href: '/collection/bundles' },
    { label: 'Closures', href: '/collection/closures' },
    { label: 'Frontals', href: '/collection/frontals' },
    { label: 'Bundle Deals', href: '/collection/deals' },
  ];

  readonly companyLinks: FooterLink[] = [
    { label: 'Our Story', href: '/our-story' },
    { label: 'Contact', href: '/contact' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'Ambassador Program', href: '/ambassador' },
  ];

  readonly supportLinks: FooterLink[] = [
    { label: 'Hair Care Guide', href: '/hair-care' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  onFooterLinkClick(href: string): void {
    this.router.navigate([href]);
  }
}
