import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

interface MetricCard {
  label: string;
  value: string;
  change: string;
  icon: string;
  iconColor: string;
  changeColor: string;
}

interface RecentProduct {
  name: string;
  type: string;
  price: string;
  origin: string;
}

interface RecentInquiry {
  initials: string;
  name: string;
  message: string;
  time: string;
  avatarBg: string;
  avatarColor: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage {
  metrics: MetricCard[] = [
    { label: 'Total Products', value: '47', change: '+8 this month', icon: 'trending_up', iconColor: 'var(--success)', changeColor: 'var(--success)' },
    { label: 'Active Inquiries', value: '23', change: '+15.3%', icon: 'trending_up', iconColor: 'var(--success)', changeColor: 'var(--success)' },
    { label: 'Hair Origins', value: '5', change: '5 countries', icon: 'public', iconColor: 'var(--info)', changeColor: 'var(--info)' },
    { label: 'Testimonials', value: '12', change: '+3 new', icon: 'trending_up', iconColor: 'var(--success)', changeColor: 'var(--success)' },
  ];

  recentProducts: RecentProduct[] = [
    { name: 'Cambodian Straight Bundle 18"', type: 'Bundle', price: '$185', origin: 'Cambodia' },
    { name: 'Indian Curly Bundle 24"', type: 'Bundle', price: '$175', origin: 'India' },
    { name: 'Vietnamese Wavy Wig 20"', type: 'Wig', price: '$450', origin: 'Vietnam' },
    { name: 'Indonesian Body Wave 22"', type: 'Bundle', price: '$210', origin: 'Indonesia' },
  ];
  productColumns = ['name', 'type', 'price', 'origin'];

  recentInquiries: RecentInquiry[] = [
    { initials: 'SR', name: 'Sarah Robinson', message: 'Interested in Cambodian bundles', time: '2h ago', avatarBg: 'var(--primary-light)', avatarColor: 'var(--primary-dark)' },
    { initials: 'MT', name: 'Maya Thompson', message: 'Question about wig customization', time: '5h ago', avatarBg: 'var(--secondary-light)', avatarColor: 'var(--secondary)' },
    { initials: 'JC', name: 'Jessica Chen', message: 'Bulk order pricing for salon', time: '1d ago', avatarBg: 'var(--info-light)', avatarColor: 'var(--info)' },
    { initials: 'AW', name: 'Aisha Williams', message: 'Shipping timeline for frontals', time: '2d ago', avatarBg: 'var(--warning-light)', avatarColor: 'var(--warning)' },
  ];
}
