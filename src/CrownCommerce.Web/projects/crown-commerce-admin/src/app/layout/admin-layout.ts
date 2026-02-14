import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatIconModule,
    MatIconButton,
    MatToolbarModule,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'inventory_2', label: 'Products', route: '/products' },
    { icon: 'public', label: 'Origins', route: '/origins' },
    { icon: 'mail', label: 'Inquiries', route: '/inquiries' },
    { icon: 'star', label: 'Testimonials', route: '/testimonials' },
    { icon: 'group', label: 'Subscribers', route: '/subscribers' },
    { icon: 'view_carousel', label: 'Hero Content', route: '/hero-content' },
    { icon: 'verified', label: 'Trust Bar', route: '/trust-bar' },
    { icon: 'handshake', label: 'Vendors', route: '/vendors' },
  ];
}
