import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SchedulingService, type Employee, type CreateMeetingRequest } from 'api';

@Component({
  selector: 'app-meeting-form',
  imports: [
    DatePipe,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
  ],
  templateUrl: './meeting-form.html',
  styleUrl: './meeting-form.scss',
})
export class MeetingFormPage implements OnInit {
  private readonly schedulingService = inject(SchedulingService);
  private readonly router = inject(Router);

  readonly employees = signal<Employee[]>([]);
  readonly saving = signal(false);
  readonly error = signal('');

  title = '';
  description = '';
  meetingDate: Date | null = null;
  startTime = '09:00';
  endTime = '10:00';
  location = '';
  organizerId = '';
  selectedAttendeeIds: string[] = [];
  exportCalendar = false;

  ngOnInit() {
    this.schedulingService.getEmployees('Active').subscribe({
      next: (data) => this.employees.set(data),
    });
  }

  getTimeZoneLabel(tz: string): string {
    switch (tz) {
      case 'Africa/Nairobi': return 'EAT';
      case 'America/New_York': return 'ET';
      case 'America/Los_Angeles': return 'PT';
      default: return tz;
    }
  }

  onSubmit() {
    if (!this.title || !this.meetingDate || !this.organizerId || this.selectedAttendeeIds.length === 0) {
      this.error.set('Please fill in all required fields and select at least one attendee.');
      return;
    }

    const [startH, startM] = this.startTime.split(':').map(Number);
    const [endH, endM] = this.endTime.split(':').map(Number);

    const startDate = new Date(this.meetingDate);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(this.meetingDate);
    endDate.setHours(endH, endM, 0, 0);

    if (endDate <= startDate) {
      this.error.set('End time must be after start time.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const request: CreateMeetingRequest = {
      title: this.title,
      description: this.description || undefined,
      startTimeUtc: startDate.toISOString(),
      endTimeUtc: endDate.toISOString(),
      location: this.location || undefined,
      organizerId: this.organizerId,
      attendeeEmployeeIds: this.selectedAttendeeIds,
    };

    this.schedulingService.createMeeting(request).subscribe({
      next: (meeting) => {
        if (this.exportCalendar) {
          this.schedulingService.exportMeetingToICal(meeting.id).subscribe({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'meeting.ics';
              a.click();
              window.URL.revokeObjectURL(url);
              this.router.navigate(['/schedule']);
            },
            error: () => this.router.navigate(['/schedule']),
          });
        } else {
          this.router.navigate(['/schedule']);
        }
      },
      error: () => {
        this.error.set('Failed to book meeting. Please try again.');
        this.saving.set(false);
      },
    });
  }
}
