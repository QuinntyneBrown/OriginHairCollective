import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SchedulingService, type CalendarEvent, type Employee } from 'api';
import { ConfirmDialog } from '../../shared/confirm-dialog';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-schedule-calendar',
  imports: [
    DatePipe,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './schedule-calendar.html',
  styleUrl: './schedule-calendar.scss',
})
export class ScheduleCalendarPage implements OnInit {
  private readonly schedulingService = inject(SchedulingService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly employees = signal<Employee[]>([]);
  readonly events = signal<CalendarEvent[]>([]);
  readonly currentDate = signal(new Date());
  readonly selectedEmployeeId = signal<string>('');
  readonly selectedEvent = signal<CalendarEvent | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly monthLabel = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly calendarDays = computed(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    const days: CalendarDay[] = [];

    // Pad from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -firstDay.getDay() + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false, isToday: false, events: [] });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const dayEvents = this.events().filter(e => {
        const eventDate = new Date(e.startTimeUtc);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
      });
      days.push({ date, isCurrentMonth: true, isToday, events: dayEvents });
    }

    // Pad to complete final week
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({ date: nextDate, isCurrentMonth: false, isToday: false, events: [] });
      }
    }

    return days;
  });

  readonly upcomingEvents = computed(() =>
    this.events()
      .filter(e => new Date(e.startTimeUtc) >= new Date())
      .sort((a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime())
      .slice(0, 5)
  );

  ngOnInit() {
    this.schedulingService.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: () => this.error.set('Failed to load employees'),
    });
    this.loadEvents();
  }

  loadEvents() {
    const d = this.currentDate();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const empId = this.selectedEmployeeId() || undefined;

    this.schedulingService.getCalendarEvents(start.toISOString(), end.toISOString(), empId).subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load calendar events');
        this.loading.set(false);
      },
    });
  }

  previousMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.loadEvents();
  }

  nextMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.loadEvents();
  }

  goToToday() {
    this.currentDate.set(new Date());
    this.loadEvents();
  }

  onEmployeeFilter(employeeId: string) {
    this.selectedEmployeeId.set(employeeId);
    this.loadEvents();
  }

  selectEvent(event: CalendarEvent) {
    this.selectedEvent.set(event);
  }

  formatTime(utcStr: string): string {
    return new Date(utcStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  cancelMeeting(meetingId: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Cancel Meeting',
        message: 'Are you sure you want to cancel this meeting?',
        confirmText: 'Cancel Meeting',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.schedulingService.cancelMeeting(meetingId).subscribe({
        next: () => {
          this.selectedEvent.set(null);
          this.loadEvents();
        },
        error: () => this.error.set('Failed to cancel meeting'),
      });
    });
  }

  editMeeting(meetingId: string) {
    this.router.navigate(['/meetings', meetingId, 'edit']);
  }

  getEventColor(status: string): string {
    switch (status) {
      case 'Scheduled': return 'var(--primary)';
      case 'InProgress': return 'var(--success)';
      case 'Completed': return 'var(--on-surface-variant)';
      case 'Cancelled': return 'var(--error)';
      default: return 'var(--primary)';
    }
  }
}
