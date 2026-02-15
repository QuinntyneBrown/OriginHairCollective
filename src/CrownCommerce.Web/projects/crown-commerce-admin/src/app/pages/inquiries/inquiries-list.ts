import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { InquiryService, type Inquiry } from 'api';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { InquiryDetailDialog } from './inquiry-detail-dialog';

@Component({
  selector: 'app-inquiries-list',
  imports: [
    DatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './inquiries-list.html',
  styleUrl: './inquiries-list.scss',
})
export class InquiriesListPage implements OnInit {
  protected readonly Math = Math;
  private readonly inquiryService = inject(InquiryService);
  private readonly dialog = inject(MatDialog);
  readonly inquiries = signal<Inquiry[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  displayedColumns = ['name', 'email', 'phone', 'message', 'date', 'actions'];

  readonly pageIndex = signal(0);
  readonly pageSize = 10;

  readonly filteredInquiries = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.inquiries();
    return this.inquiries().filter(i =>
      i.name?.toLowerCase().includes(term) ||
      i.email?.toLowerCase().includes(term) ||
      i.message?.toLowerCase().includes(term)
    );
  });

  readonly paginatedInquiries = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredInquiries().slice(start, start + this.pageSize);
  });

  previousPage() {
    if (this.pageIndex() > 0) this.pageIndex.update(i => i - 1);
  }

  nextPage() {
    if ((this.pageIndex() + 1) * this.pageSize < this.filteredInquiries().length) {
      this.pageIndex.update(i => i + 1);
    }
  }

  ngOnInit() {
    this.loadInquiries();
  }

  loadInquiries() {
    this.inquiryService.getInquiries().subscribe({
      next: (data) => {
        this.inquiries.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load inquiries');
        this.loading.set(false);
      },
    });
  }

  viewInquiry(inquiry: Inquiry) {
    this.dialog.open(InquiryDetailDialog, { data: inquiry });
  }

  exportInquiries() {
    const data = this.filteredInquiries();
    if (data.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Message', 'Date'];
    const rows = data.map(i => [
      i.name,
      i.email,
      i.phone ?? '',
      `"${(i.message ?? '').replace(/"/g, '""')}"`,
      i.createdAt,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inquiries.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  deleteInquiry(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Inquiry',
        message: 'Are you sure you want to delete this inquiry? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.inquiryService.deleteInquiry(id).subscribe({
        next: () => this.loadInquiries(),
        error: () => this.error.set('Failed to delete inquiry'),
      });
    });
  }
}
