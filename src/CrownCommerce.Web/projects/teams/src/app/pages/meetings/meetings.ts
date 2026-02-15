import { Component, computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MEETINGS, type Meeting } from '../../data/mock-data';

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
}

@Component({
  selector: 'app-meetings',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './meetings.html',
  styleUrl: './meetings.scss',
})
export class MeetingsPage {
  private readonly today = new Date();

  readonly selectedDate = signal(this.formatDate(this.today));

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

  readonly filteredMeetings = computed(() =>
    MEETINGS.filter((m) => m.date === this.selectedDate())
  );

  readonly currentMonthYear = computed(() => {
    const d = new Date(this.selectedDate());
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  selectDate(dateStr: string) {
    this.selectedDate.set(dateStr);
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
