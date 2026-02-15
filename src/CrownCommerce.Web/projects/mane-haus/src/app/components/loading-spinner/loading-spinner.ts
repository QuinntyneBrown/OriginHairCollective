import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `,
  styles: `
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-bg-card, #1c1917);
      border-top-color: var(--color-gold, #c8a55a);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
})
export class LoadingSpinnerComponent {}
