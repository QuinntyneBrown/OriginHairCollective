import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContentService, type Testimonial } from 'api';

export interface TestimonialFormDialogData {
  testimonial?: Testimonial;
}

@Component({
  selector: 'app-testimonial-form-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Testimonial' : 'Add Testimonial' }}</h2>
    <mat-dialog-content>
      <div class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Customer Name</mat-label>
          <input matInput placeholder="e.g. Jane Smith" [(ngModel)]="customerName" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Location (optional)</mat-label>
          <input matInput placeholder="e.g. Toronto, ON" [(ngModel)]="customerLocation">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rating (1-5)</mat-label>
          <input matInput type="number" min="1" max="5" [(ngModel)]="rating" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Review</mat-label>
          <textarea matInput rows="4" placeholder="Enter review content..." [(ngModel)]="content" required></textarea>
        </mat-form-field>
      </div>
      @if (error()) {
        <p class="error-text">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!isFormValid || saving()" (click)="onSubmit()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditMode ? 'Update' : 'Add' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 400px;
    }
    .full-width { width: 100%; }
    .error-text { color: var(--error, #d32f2f); font-size: 13px; margin: 8px 0 0; }
  `],
})
export class TestimonialFormDialog implements OnInit {
  private readonly contentService = inject(ContentService);
  readonly data = inject<TestimonialFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<TestimonialFormDialog>);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  customerName = '';
  customerLocation = '';
  rating: number | null = 5;
  content = '';

  isEditMode = false;

  ngOnInit() {
    if (this.data.testimonial) {
      this.isEditMode = true;
      this.customerName = this.data.testimonial.customerName;
      this.customerLocation = this.data.testimonial.customerLocation ?? '';
      this.rating = this.data.testimonial.rating;
      this.content = this.data.testimonial.content;
    }
  }

  get isFormValid(): boolean {
    return !!(
      this.customerName.trim() &&
      this.content.trim() &&
      this.rating != null && this.rating >= 1 && this.rating <= 5
    );
  }

  onSubmit() {
    if (!this.isFormValid) return;

    this.saving.set(true);
    this.error.set(null);

    const request = {
      customerName: this.customerName.trim(),
      customerLocation: this.customerLocation.trim() || undefined,
      content: this.content.trim(),
      rating: this.rating!,
    };

    const operation = this.isEditMode
      ? this.contentService.updateTestimonial(this.data.testimonial!.id, request)
      : this.contentService.createTestimonial(request);

    operation.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.error.set(`Failed to ${this.isEditMode ? 'update' : 'create'} testimonial`);
        this.saving.set(false);
      },
    });
  }
}
