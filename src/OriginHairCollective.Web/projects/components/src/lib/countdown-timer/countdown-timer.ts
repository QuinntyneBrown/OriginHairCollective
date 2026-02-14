import { Component, input, signal, DestroyRef, inject, OnInit } from '@angular/core';

export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'lib-countdown-timer',
  template: `
    <div class="countdown">
      <div class="countdown__unit">
        <span class="countdown__number">{{ padded(remaining().days) }}</span>
        <span class="countdown__label">DAYS</span>
      </div>
      <div class="countdown__unit">
        <span class="countdown__number">{{ padded(remaining().hours) }}</span>
        <span class="countdown__label">HOURS</span>
      </div>
      <div class="countdown__unit">
        <span class="countdown__number">{{ padded(remaining().minutes) }}</span>
        <span class="countdown__label">MINS</span>
      </div>
      <div class="countdown__unit">
        <span class="countdown__number">{{ padded(remaining().seconds) }}</span>
        <span class="countdown__label">SECS</span>
      </div>
    </div>
  `,
  styles: `
    .countdown {
      display: flex;
      align-items: center;
      gap: 40px;
    }

    .countdown__unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .countdown__number {
      font-family: var(--font-heading);
      font-size: 52px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .countdown__label {
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 4px;
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .countdown {
        gap: 20px;
      }

      .countdown__number {
        font-size: 36px;
      }

      .countdown__unit {
        gap: 4px;
      }

      .countdown__label {
        font-size: 9px;
        letter-spacing: 3px;
      }
    }
  `,
})
export class CountdownTimerComponent implements OnInit {
  targetDate = input.required<string>();

  remaining = signal<CountdownValues>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.tick();
    const interval = setInterval(() => this.tick(), 1000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  padded(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private tick() {
    const now = Date.now();
    const target = new Date(this.targetDate()).getTime();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.remaining.set({ days, hours, minutes, seconds });
  }
}
