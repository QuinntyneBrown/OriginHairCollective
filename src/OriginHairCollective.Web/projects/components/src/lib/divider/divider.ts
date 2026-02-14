import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-divider',
  imports: [NgClass],
  template: `
    <hr
      class="divider"
      [ngClass]="{
        'divider--accent': variant() === 'accent',
        'divider--subtle': variant() === 'subtle'
      }"
    />
  `,
  styles: `
    .divider {
      border: none;
      height: 1px;
      width: 100%;
      background: var(--color-bg-card);
      margin: 0;
    }

    .divider--accent {
      width: 56px;
      height: 2px;
      border-radius: 1px;
      background: var(--color-gold);
    }

    .divider--subtle {
      background: var(--color-bg-card);
    }

    @media (max-width: 768px) {
      .divider--accent {
        width: 48px;
      }
    }
  `,
})
export class DividerComponent {
  variant = input<'default' | 'accent' | 'subtle'>('default');
}
