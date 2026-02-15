import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface TrustBarItem {
  icon: string;
  label: string;
  description: string;
  order: number;
  status: string;
}

export interface TrustBarItemDialogData {
  item?: TrustBarItem;
}

@Component({
  selector: 'app-trust-bar-item-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Trust Bar Item' : 'Add Trust Bar Item' }}</h2>
    <mat-dialog-content>
      <div class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Icon (Material icon name)</mat-label>
          <input matInput placeholder="e.g. verified" [(ngModel)]="icon" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Label</mat-label>
          <input matInput placeholder="e.g. 100% Virgin Hair" [(ngModel)]="label" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <input matInput placeholder="e.g. Ethically sourced" [(ngModel)]="description">
        </mat-form-field>
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Order</mat-label>
            <input matInput type="number" min="1" [(ngModel)]="order" required>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!isFormValid" (click)="onSubmit()">
        {{ isEditMode ? 'Update' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; gap: 8px; min-width: 400px; }
    .full-width { width: 100%; }
    .two-col { display: flex; gap: 16px; > * { flex: 1; } }
  `],
})
export class TrustBarItemDialog implements OnInit {
  readonly data = inject<TrustBarItemDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<TrustBarItemDialog>);

  icon = '';
  label = '';
  description = '';
  order: number | null = 1;
  status = 'Active';
  isEditMode = false;

  ngOnInit() {
    if (this.data.item) {
      this.isEditMode = true;
      this.icon = this.data.item.icon;
      this.label = this.data.item.label;
      this.description = this.data.item.description;
      this.order = this.data.item.order;
      this.status = this.data.item.status;
    }
  }

  get isFormValid(): boolean {
    return !!(this.icon.trim() && this.label.trim() && this.order != null && this.order > 0);
  }

  onSubmit() {
    if (!this.isFormValid) return;
    this.dialogRef.close({
      icon: this.icon.trim(),
      label: this.label.trim(),
      description: this.description.trim(),
      order: this.order!,
      status: this.status,
    } as TrustBarItem);
  }
}
