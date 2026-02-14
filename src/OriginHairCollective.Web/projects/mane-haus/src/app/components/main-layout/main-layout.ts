import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  ButtonComponent,
  ChatWidgetComponent,
  CloseButtonComponent,
  FooterLinkColumnComponent,
  SocialIconsComponent,
  LogoComponent,
  DividerComponent,
} from 'components';
import type { FooterLink, SocialLink } from 'components';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    ButtonComponent,
    CloseButtonComponent,
    FooterLinkColumnComponent,
    SocialIconsComponent,
    LogoComponent,
    DividerComponent,
    ChatWidgetComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  mobileMenuOpen = false;

  readonly navLinks = [
    { label: 'Collection', href: '#collection' },
    { label: 'Our Story', href: '#story' },
    { label: 'Hair Care', href: '#care' },
    { label: 'Contact', href: '#contact' },
  ];

  readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/manehaus' },
    { platform: 'tiktok', href: 'https://tiktok.com/@manehaus' },
    { platform: 'email', href: 'mailto:hello@manehaus.ca' },
  ];

  readonly shopLinks: FooterLink[] = [
    { label: 'Bundles', href: '#' },
    { label: 'Closures', href: '#' },
    { label: 'Frontals', href: '#' },
    { label: 'Bundle Deals', href: '#' },
  ];

  readonly companyLinks: FooterLink[] = [
    { label: 'Our Story', href: '#story' },
    { label: 'Contact', href: '#contact' },
    { label: 'Wholesale', href: '#' },
    { label: 'Ambassador Program', href: '#' },
  ];

  readonly supportLinks: FooterLink[] = [
    { label: 'Hair Care Guide', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Returns & Exchanges', href: '#' },
    { label: 'FAQ', href: '#' },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
