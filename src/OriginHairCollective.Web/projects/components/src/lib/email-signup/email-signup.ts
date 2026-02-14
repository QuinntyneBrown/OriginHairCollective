import { Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-email-signup',
  template: `
    <form class="email-signup" (submit)="onSubmit($event)">
      <div class="email-signup__input">
        <svg
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
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        <input
          type="email"
          [placeholder]="placeholder()"
          required
          #emailInput
        />
      </div>
      <button class="email-signup__button" type="submit">
        {{ buttonText() }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
      </button>
    </form>
  `,
  styles: `
    .email-signup {
      display: flex;
      gap: 12px;
      width: 100%;
    }

    .email-signup__input {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      height: 56px;
      padding: 0 24px;
      border-radius: 100px;
      border: 1px solid var(--color-gold-border);
      background: transparent;

      svg {
        flex-shrink: 0;
        color: var(--color-text-muted);
      }

      input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        color: var(--color-text-primary);
        font-family: var(--font-body);
        font-size: 14px;

        &::placeholder {
          color: var(--color-text-muted);
        }
      }
    }

    .email-signup__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 200px;
      height: 56px;
      border: none;
      border-radius: 100px;
      background: var(--color-gold);
      color: var(--color-bg-primary);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      cursor: pointer;
      flex-shrink: 0;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.9;
      }
    }

    @media (max-width: 768px) {
      .email-signup {
        flex-direction: column;
      }

      .email-signup__input {
        height: 52px;
        padding: 0 20px;
      }

      .email-signup__button {
        width: 100%;
        height: 52px;
      }
    }
  `,
})
export class EmailSignupComponent {
  placeholder = input('Enter your email address');
  buttonText = input('GET NOTIFIED');

  submitted = output<string>();

  onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    if (input.validity.valid && input.value) {
      this.submitted.emit(input.value);
      input.value = '';
    }
  }
}
