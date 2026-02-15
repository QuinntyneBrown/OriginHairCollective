import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'lib-error-state',
  imports: [ButtonComponent],
  template: `
    <div class="error-state">
      <p class="error-state__message">{{ message() }}</p>
      <lib-button variant="secondary" size="small" (click)="retry.emit()">Try Again</lib-button>
    </div>
  `,
  styles: `
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
    }

    .error-state__message {
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--color-text-secondary, #a8a29e);
    }
  `,
})
export class ErrorStateComponent {
  message = input('Something went wrong. Please try again.');
  retry = output<void>();
}
