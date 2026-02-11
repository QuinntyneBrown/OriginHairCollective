import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface TrustBarItem {
  icon: string;
  label: string;
  description: string;
  order: number;
  status: string;
}

@Component({
  selector: 'app-trust-bar-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './trust-bar-list.html',
  styleUrl: './trust-bar-list.scss',
})
export class TrustBarListPage {
  displayedColumns = ['icon', 'label', 'description', 'order', 'status', 'actions'];

  items: TrustBarItem[] = [
    { icon: 'verified', label: '100% Virgin Hair', description: 'Ethically sourced, unprocessed hair', order: 1, status: 'Active' },
    { icon: 'local_shipping', label: 'Free Shipping', description: 'Free shipping on orders over $150', order: 2, status: 'Active' },
    { icon: 'support_agent', label: '24/7 Support', description: 'Customer support via chat and email', order: 3, status: 'Active' },
    { icon: 'lock', label: 'Secure Payments', description: 'SSL encrypted checkout process', order: 4, status: 'Active' },
  ];
}
