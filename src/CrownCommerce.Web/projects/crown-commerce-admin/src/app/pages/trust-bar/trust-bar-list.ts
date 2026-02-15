import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TrustBarItemDialog, type TrustBarItem } from './trust-bar-item-dialog';
import { ConfirmDialog } from '../../shared/confirm-dialog';

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
  private readonly dialog = inject(MatDialog);

  displayedColumns = ['icon', 'label', 'description', 'order', 'status', 'actions'];

  // TODO: Replace with API call when trust bar endpoint exists
  readonly items = signal<TrustBarItem[]>([
    { icon: 'verified', label: '100% Virgin Hair', description: 'Ethically sourced, unprocessed hair', order: 1, status: 'Active' },
    { icon: 'local_shipping', label: 'Free Shipping', description: 'Free shipping on orders over $150', order: 2, status: 'Active' },
    { icon: 'support_agent', label: '24/7 Support', description: 'Customer support via chat and email', order: 3, status: 'Active' },
    { icon: 'lock', label: 'Secure Payments', description: 'SSL encrypted checkout process', order: 4, status: 'Active' },
  ]);

  addItem() {
    const dialogRef = this.dialog.open(TrustBarItemDialog, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: TrustBarItem | undefined) => {
      if (!result) return;
      this.items.update(items => [...items, result].sort((a, b) => a.order - b.order));
      // TODO: Call API to persist when endpoint exists
    });
  }

  editItem(index: number) {
    const item = this.items()[index];
    const dialogRef = this.dialog.open(TrustBarItemDialog, {
      data: { item },
    });

    dialogRef.afterClosed().subscribe((result: TrustBarItem | undefined) => {
      if (!result) return;
      this.items.update(items => {
        const updated = [...items];
        updated[index] = result;
        return updated.sort((a, b) => a.order - b.order);
      });
      // TODO: Call API to persist when endpoint exists
    });
  }

  deleteItem(index: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Trust Bar Item',
        message: 'Are you sure you want to delete this trust bar item?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.items.update(items => items.filter((_, i) => i !== index));
      // TODO: Call API to persist when endpoint exists
    });
  }
}
