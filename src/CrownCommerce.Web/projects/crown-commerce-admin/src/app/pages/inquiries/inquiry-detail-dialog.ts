import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import type { Inquiry } from 'api';

@Component({
  selector: 'app-inquiry-detail-dialog',
  imports: [DatePipe, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Inquiry Details</h2>
    <mat-dialog-content>
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Name</span>
          <span class="detail-value">{{ data.name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">{{ data.email }}</span>
        </div>
        @if (data.phone) {
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">{{ data.phone }}</span>
          </div>
        }
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">{{ data.createdAt | date:'medium' }}</span>
        </div>
        <div class="detail-row detail-row--full">
          <span class="detail-label">Message</span>
          <p class="detail-message">{{ data.message }}</p>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .detail-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }
    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--on-surface-variant, #666);
    }
    .detail-value {
      font-size: 14px;
      color: var(--on-surface, #333);
    }
    .detail-message {
      font-size: 14px;
      line-height: 1.6;
      color: var(--on-surface, #333);
      margin: 0;
      white-space: pre-wrap;
    }
  `],
})
export class InquiryDetailDialog {
  readonly data = inject<Inquiry>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<InquiryDetailDialog>);
}
