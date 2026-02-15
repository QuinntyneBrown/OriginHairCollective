import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { SchedulingService, type Employee } from 'api';
import { EmployeeDetailDialog } from './employee-detail-dialog';

type StatusFilter = 'all' | 'Active' | 'Inactive' | 'OnLeave';

@Component({
  selector: 'app-employees-list',
  imports: [
    DatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employees-list.html',
  styleUrl: './employees-list.scss',
})
export class EmployeesListPage implements OnInit {
  private readonly schedulingService = inject(SchedulingService);
  private readonly dialog = inject(MatDialog);

  readonly employees = signal<Employee[]>([]);
  readonly selectedStatus = signal<StatusFilter>('all');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly displayedColumns = ['name', 'jobTitle', 'department', 'timeZone', 'status', 'actions'];

  readonly stats = computed(() => {
    const emps = this.employees();
    return [
      { label: 'Total', value: emps.length, icon: 'people', color: 'var(--primary)' },
      { label: 'Active', value: emps.filter(e => e.status === 'Active').length, icon: 'check_circle', color: 'var(--success)' },
      { label: 'On Leave', value: emps.filter(e => e.status === 'OnLeave').length, icon: 'event_busy', color: 'var(--warning)' },
      { label: 'Kenya Team', value: emps.filter(e => e.timeZone === 'Africa/Nairobi').length, icon: 'public', color: 'var(--info)' },
    ];
  });

  readonly filteredEmployees = computed(() => {
    const status = this.selectedStatus();
    if (status === 'all') return this.employees();
    return this.employees().filter(e => e.status === status);
  });

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    const status = this.selectedStatus();
    const statusParam = status === 'all' ? undefined : status;
    this.schedulingService.getEmployees(statusParam).subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load employees');
        this.loading.set(false);
      },
    });
  }

  onStatusChange(status: StatusFilter) {
    this.selectedStatus.set(status);
    this.loadEmployees();
  }

  viewEmployee(employee: Employee) {
    const dialogRef = this.dialog.open(EmployeeDetailDialog, {
      data: { employee },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadEmployees();
    });
  }

  editEmployee(employee: Employee) {
    const dialogRef = this.dialog.open(EmployeeDetailDialog, {
      data: { employee, editMode: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadEmployees();
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'chip chip--success';
      case 'Inactive': return 'chip chip--error';
      case 'OnLeave': return 'chip chip--warning';
      default: return 'chip chip--default';
    }
  }

  getTimeZoneLabel(tz: string): string {
    switch (tz) {
      case 'Africa/Nairobi': return 'Kenya (EAT)';
      case 'America/New_York': return 'New York (ET)';
      case 'America/Los_Angeles': return 'Los Angeles (PT)';
      default: return tz;
    }
  }
}
