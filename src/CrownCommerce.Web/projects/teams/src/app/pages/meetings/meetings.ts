import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SchedulingService, type CalendarEvent } from 'api';
import type { Meeting } from '../../data/mock-data';

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
}

const MEETING_COLORS = ['#6366F1', '#FF6B6B', '#22C55E', '#FCD34D', '#06B6D4', '#F97316'];

@Component({
  selector: 'app-meetings',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './meetings.html',
  styleUrl: './meetings.scss',
})
export class MeetingsPage {
  private readonly schedulingService = inject(SchedulingService);
  private readonly today = new Date();

  readonly selectedDate = signal(this.formatDate(this.today));
  readonly apiMeetings = signal<Meeting[]>([]);

  readonly weekDays = computed<WeekDay[]>(() => {
    const start = new Date(this.today);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const days: WeekDay[] = [];
    const todayStr = this.formatDate(this.today);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        dateStr: this.formatDate(d),
        isToday: this.formatDate(d) === todayStr,
      });
    }
    return days;
  });

  readonly filteredMeetings = computed(() => this.apiMeetings());

  readonly currentMonthYear = computed(() => {
    const d = new Date(this.selectedDate());
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  constructor() {
    effect(() => {
      const dateStr = this.selectedDate();
      const startUtc = `${dateStr}T00:00:00Z`;
      const endUtc = `${dateStr}T23:59:59Z`;

      this.schedulingService.getCalendarEvents(startUtc, endUtc).subscribe((events) => {
        this.apiMeetings.set(events.map((e, i) => this.mapEventToMeeting(e, i)));
      });
    });
  }

  selectDate(dateStr: string) {
    this.selectedDate.set(dateStr);
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private mapEventToMeeting(event: CalendarEvent, index: number): Meeting {
    const start = new Date(event.startTimeUtc);
    const end = new Date(event.endTimeUtc);
    return {
      id: index + 1,
      title: event.title,
      startTime: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      endTime: end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: this.formatDate(start),
      color: MEETING_COLORS[index % MEETING_COLORS.length],
      participants: [{ name: event.organizerName, initials: this.getInitials(event.organizerName) }],
      location: event.location ?? undefined,
      isVirtual: event.location === null,
    };
  }

  private getInitials(name: string): string {
    return name.split(' ').map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);
  }
}
