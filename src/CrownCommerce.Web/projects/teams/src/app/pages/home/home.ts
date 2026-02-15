import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SchedulingService } from 'api';
import { map, switchMap } from 'rxjs';
import { TIME_ZONES, type Meeting, type ActivityItem, type TimeZoneCard } from '../../data/mock-data';

const MEETING_COLORS = ['#C9A052', '#B8816B', '#2E7D32', '#E65100', '#1565C0', '#8B6914'];
const ACTIVITY_COLORS: Record<string, string> = { message: '#C9A052', meeting: '#B8816B', task: '#2E7D32', file: '#E65100' };

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  private readonly schedulingService = inject(SchedulingService);
  private readonly now = new Date();

  readonly greeting = computed(() => {
    const hour = this.now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  readonly todayFormatted = computed(() => {
    return this.now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  });

  readonly timeZones = signal<TimeZoneCard[]>(TIME_ZONES);

  private readonly apiMeetings = toSignal(
    this.schedulingService.getUpcomingMeetings(3).pipe(
      map((meetings) =>
        meetings.map((m, i) => {
          const start = new Date(m.startTimeUtc);
          const end = new Date(m.endTimeUtc);
          return {
            id: i + 1,
            title: m.title,
            startTime: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            endTime: end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: start.toISOString().split('T')[0],
            color: MEETING_COLORS[i % MEETING_COLORS.length],
            participants: m.attendees.map((a) => ({
              name: a.employeeName,
              initials: a.employeeName.split(' ').map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2),
            })),
            location: m.location ?? undefined,
            isVirtual: m.location === null,
          } as Meeting;
        })
      )
    ),
    { initialValue: [] as Meeting[] }
  );

  readonly upcomingMeetings = computed(() => this.apiMeetings());

  private readonly apiActivities = toSignal(
    this.schedulingService.getEmployees().pipe(
      switchMap((employees) => {
        const currentId = employees[0]?.id ?? '';
        return this.schedulingService.getActivityFeed(currentId, 6);
      }),
      map((items) =>
        items.map((item, i) => ({
          id: i + 1,
          type: item.type as ActivityItem['type'],
          icon: item.icon,
          title: item.title,
          description: item.description,
          time: this.formatRelativeTime(item.occurredAt),
          color: ACTIVITY_COLORS[item.type] ?? '#6366F1',
        }))
      )
    ),
    { initialValue: [] as ActivityItem[] }
  );

  readonly activities = computed(() => this.apiActivities());

  getCurrentTime(offset: string): string {
    const utcOffset = parseInt(offset.replace('UTC', ''), 10) || 0;
    const utc = new Date(this.now.getTime() + this.now.getTimezoneOffset() * 60000);
    const local = new Date(utc.getTime() + utcOffset * 3600000);
    return local.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  private formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMs = this.now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
