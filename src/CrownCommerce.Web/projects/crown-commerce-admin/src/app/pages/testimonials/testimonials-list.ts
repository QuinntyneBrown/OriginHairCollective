import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ContentService, type Testimonial } from 'api';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { TestimonialFormDialog } from './testimonial-form-dialog';

@Component({
  selector: 'app-testimonials-list',
  imports: [
    DatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './testimonials-list.html',
  styleUrl: './testimonials-list.scss',
})
export class TestimonialsListPage implements OnInit {
  protected readonly Math = Math;
  private readonly contentService = inject(ContentService);
  private readonly dialog = inject(MatDialog);
  readonly testimonials = signal<Testimonial[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  displayedColumns = ['customer', 'rating', 'review', 'date', 'actions'];

  readonly pageIndex = signal(0);
  readonly pageSize = 10;

  readonly filteredTestimonials = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.testimonials();
    return this.testimonials().filter(t =>
      t.customerName?.toLowerCase().includes(term) ||
      t.content?.toLowerCase().includes(term)
    );
  });

  readonly paginatedTestimonials = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredTestimonials().slice(start, start + this.pageSize);
  });

  previousPage() {
    if (this.pageIndex() > 0) this.pageIndex.update(i => i - 1);
  }

  nextPage() {
    if ((this.pageIndex() + 1) * this.pageSize < this.filteredTestimonials().length) {
      this.pageIndex.update(i => i + 1);
    }
  }

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.contentService.getTestimonials().subscribe({
      next: (data) => {
        this.testimonials.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load testimonials');
        this.loading.set(false);
      },
    });
  }

  addTestimonial() {
    const dialogRef = this.dialog.open(TestimonialFormDialog, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadTestimonials();
    });
  }

  editTestimonial(testimonial: Testimonial) {
    const dialogRef = this.dialog.open(TestimonialFormDialog, {
      data: { testimonial },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadTestimonials();
    });
  }

  deleteTestimonial(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Testimonial',
        message: 'Are you sure you want to delete this testimonial? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.contentService.deleteTestimonial(id).subscribe({
        next: () => this.loadTestimonials(),
        error: () => this.error.set('Failed to delete testimonial'),
      });
    });
  }
}
