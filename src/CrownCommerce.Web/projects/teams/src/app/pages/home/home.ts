import { Component, computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MEETINGS, ACTIVITY_ITEMS, TIME_ZONES, type Meeting, type ActivityItem, type TimeZoneCard } from '../../data/mock-data';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
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

  readonly upcomingMeetings = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return MEETINGS.filter((m) => m.date === today).slice(0, 3);
  });

  readonly activities = signal<ActivityItem[]>(ACTIVITY_ITEMS);

  getCurrentTime(offset: string): string {
    const utcOffset = parseInt(offset.replace('UTC', ''), 10) || 0;
    const utc = new Date(this.now.getTime() + this.now.getTimezoneOffset() * 60000);
    const local = new Date(utc.getTime() + utcOffset * 3600000);
    return local.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
