import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-button',
  imports: [NgClass],
  template: `
    <button
      [ngClass]="{
        'btn': true,
        'btn--primary': variant() === 'primary',
        'btn--secondary': variant() === 'secondary',
        'btn--small': size() === 'small',
        'btn--large': size() === 'large'
      }"
      [type]="type()"
      [disabled]="disabled()"
      (click)="clicked.emit()"
    >
      <ng-content />
      @if (showArrow()) {
        <svg
          class="btn__arrow"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      }
    </button>
  `,
  styles: `
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
      border-radius: 100px;
      cursor: pointer;
      font-family: var(--font-body);
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      transition: opacity 0.2s ease;
      padding: 18px 36px;
      font-size: 14px;

      &:hover {
        opacity: 0.9;
      }
    }

    .btn--primary {
      background: var(--color-gold);
      color: var(--color-bg-primary);
    }

    .btn--secondary {
      background: transparent;
      color: var(--color-gold);
      border: 1px solid var(--color-gold-border-strong);
    }

    .btn--small {
      padding: 12px 28px;
      font-size: 12px;
    }

    .btn--large {
      padding: 20px 44px;
      font-size: 15px;
    }

    .btn__arrow {
      width: 18px;
      height: 18px;
    }
  `,
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary'>('primary');
  size = input<'small' | 'medium' | 'large'>('medium');
  showArrow = input(false);
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  clicked = output<void>();
}
