import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-logo',
  imports: [NgClass],
  template: `
    <span
      class="logo"
      [ngClass]="{
        'logo--small': size() === 'small',
        'logo--large': size() === 'large'
      }"
    >
      {{ text() }}
    </span>
  `,
  styles: `
    .logo {
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 5px;
      color: var(--color-gold);
    }

    .logo--small {
      font-size: 20px;
      letter-spacing: 4px;
    }

    .logo--large {
      font-size: 28px;
      letter-spacing: 6px;
    }
  `,
})
export class LogoComponent {
  text = input('ORIGIN');
  size = input<'small' | 'medium' | 'large'>('medium');
}
