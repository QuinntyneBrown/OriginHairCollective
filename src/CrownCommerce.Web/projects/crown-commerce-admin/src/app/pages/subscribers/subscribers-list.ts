import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { NewsletterService, type Subscriber, type SubscriberStats } from 'api';
import { ConfirmDialog } from '../../shared/confirm-dialog';

type BrandFilter = 'all' | 'origin-coming-soon' | 'mane-haus-coming-soon';

@Component({
  selector: 'app-subscribers-list',
  imports: [
    DatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './subscribers-list.html',
  styleUrl: './subscribers-list.scss',
})
export class SubscribersListPage implements OnInit {
  private readonly newsletterService = inject(NewsletterService);
  private readonly dialog = inject(MatDialog);

  readonly subscribers = signal<Subscriber[]>([]);
  readonly stats = signal<SubscriberStats | null>(null);
  readonly selectedBrand = signal<BrandFilter>('all');
  readonly totalCount = signal(0);
  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = 20;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly displayedColumns = ['email', 'status', 'brand', 'date', 'actions'];

  readonly filteredSubscribers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.subscribers();
    return this.subscribers().filter(s =>
      s.email?.toLowerCase().includes(term)
    );
  });

  readonly statCards = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Active', value: s.totalActive, icon: 'check_circle', color: 'var(--success)' },
      { label: 'Pending', value: s.totalPending, icon: 'pending', color: 'var(--warning)' },
      { label: 'Unsubscribed', value: s.totalUnsubscribed, icon: 'unsubscribe', color: 'var(--error)' },
      { label: 'Recent (7d)', value: s.recentSubscribers, icon: 'trending_up', color: 'var(--info)' },
    ];
  });

  ngOnInit() {
    this.loadSubscribers();
    this.loadStats();
  }

  onBrandChange(brand: BrandFilter) {
    this.selectedBrand.set(brand);
    this.pageIndex.set(0);
    this.loadSubscribers();
  }

  previousPage() {
    if (this.pageIndex() > 0) {
      this.pageIndex.update(i => i - 1);
      this.loadSubscribers();
    }
  }

  nextPage() {
    if ((this.pageIndex() + 1) * this.pageSize < this.totalCount()) {
      this.pageIndex.update(i => i + 1);
      this.loadSubscribers();
    }
  }

  loadSubscribers() {
    const brand = this.selectedBrand();
    const tag = brand === 'all' ? undefined : brand;
    const skip = this.pageIndex() * this.pageSize;
    this.newsletterService.getSubscribers({ pageSize: this.pageSize, skip, tag }).subscribe({
      next: (result) => {
        this.subscribers.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load subscribers');
        this.loading.set(false);
      },
    });
  }

  loadStats() {
    this.newsletterService.getSubscriberStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => this.error.set('Failed to load subscriber stats'),
    });
  }

  getBrandLabel(tags: string[]): string {
    if (tags.includes('origin-coming-soon')) return 'Origin Hair';
    if (tags.includes('mane-haus-coming-soon')) return 'Mane Haus';
    return 'Other';
  }

  getBrandClass(tags: string[]): string {
    if (tags.includes('origin-coming-soon')) return 'chip chip--default';
    if (tags.includes('mane-haus-coming-soon')) return 'chip chip--mane-haus';
    return 'chip chip--default';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'chip chip--success';
      case 'pending': return 'chip chip--warning';
      case 'unsubscribed': return 'chip chip--error';
      default: return 'chip chip--default';
    }
  }

  deleteSubscriber(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Subscriber',
        message: 'Are you sure you want to delete this subscriber? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.newsletterService.deleteSubscriber(id).subscribe({
        next: () => {
          this.loadSubscribers();
          this.loadStats();
        },
        error: () => this.error.set('Failed to delete subscriber'),
      });
    });
  }
}
