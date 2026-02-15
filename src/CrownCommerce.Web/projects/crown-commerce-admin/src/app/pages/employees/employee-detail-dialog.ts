import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SchedulingService, type Employee } from 'api';

export interface EmployeeDetailDialogData {
  employee: Employee;
  editMode?: boolean;
}

@Component({
  selector: 'app-employee-detail-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit Employee' : 'Employee Details' }}</h2>
    <mat-dialog-content>
      @if (!editing) {
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">{{ data.employee.firstName }} {{ data.employee.lastName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ data.employee.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">{{ data.employee.phone || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Job Title</span>
            <span class="detail-value">{{ data.employee.jobTitle }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Department</span>
            <span class="detail-value">{{ data.employee.department || 'Unassigned' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Zone</span>
            <span class="detail-value">{{ data.employee.timeZone }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value">{{ data.employee.status }}</span>
          </div>
        </div>
      } @else {
        <div class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone</mat-label>
            <input matInput [(ngModel)]="phone">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Job Title</mat-label>
            <input matInput [(ngModel)]="jobTitle" required>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Department</mat-label>
            <input matInput [(ngModel)]="department">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Time Zone</mat-label>
            <mat-select [(ngModel)]="timeZone">
              <mat-option value="Africa/Nairobi">Africa/Nairobi (EAT)</mat-option>
              <mat-option value="America/New_York">America/New_York (ET)</mat-option>
              <mat-option value="America/Los_Angeles">America/Los_Angeles (PT)</mat-option>
              <mat-option value="America/Chicago">America/Chicago (CT)</mat-option>
              <mat-option value="Europe/London">Europe/London (GMT)</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
              <mat-option value="OnLeave">On Leave</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        @if (error()) {
          <p class="error-text">{{ error() }}</p>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (!editing) {
        <button mat-stroked-button (click)="editing = true">Edit</button>
        <button mat-stroked-button (click)="dialogRef.close()">Close</button>
      } @else {
        <button mat-stroked-button (click)="editing = false">Cancel</button>
        <button mat-flat-button color="primary" [disabled]="saving()" (click)="onSave()">
          @if (saving()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            Save
          }
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .detail-grid, .form-grid { display: flex; flex-direction: column; gap: 12px; min-width: 400px; }
    .detail-row { display: flex; flex-direction: column; gap: 2px; }
    .detail-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--on-surface-variant, #666); }
    .detail-value { font-size: 14px; color: var(--on-surface, #333); }
    .full-width { width: 100%; }
    .error-text { color: var(--error, #d32f2f); font-size: 13px; margin: 8px 0 0; }
  `],
})
export class EmployeeDetailDialog implements OnInit {
  private readonly schedulingService = inject(SchedulingService);
  readonly data = inject<EmployeeDetailDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<EmployeeDetailDialog>);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  editing = false;
  phone = '';
  jobTitle = '';
  department = '';
  timeZone = '';
  status = '';

  ngOnInit() {
    this.editing = this.data.editMode ?? false;
    this.phone = this.data.employee.phone ?? '';
    this.jobTitle = this.data.employee.jobTitle;
    this.department = this.data.employee.department ?? '';
    this.timeZone = this.data.employee.timeZone;
    this.status = this.data.employee.status;
  }

  onSave() {
    this.saving.set(true);
    this.error.set(null);

    this.schedulingService.updateEmployee(this.data.employee.id, {
      phone: this.phone || undefined,
      jobTitle: this.jobTitle,
      department: this.department || undefined,
      timeZone: this.timeZone,
      status: this.status,
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.error.set('Failed to update employee');
        this.saving.set(false);
      },
    });
  }
}
