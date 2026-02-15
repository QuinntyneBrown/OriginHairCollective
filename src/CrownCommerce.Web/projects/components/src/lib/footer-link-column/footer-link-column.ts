import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FooterLink {
  label: string;
  href: string;
}

@Component({
  selector: 'lib-footer-link-column',
  imports: [RouterLink],
  template: `
    <nav class="footer-links">
      <h4 class="footer-links__title">{{ title() }}</h4>
      @for (link of links(); track link.label) {
        <a class="footer-links__link" [routerLink]="link.href">{{ link.label }}</a>
      }
    </nav>
  `,
  styles: `
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .footer-links__title {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--color-text-primary);
      margin: 0;
    }

    .footer-links__link {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-text-muted);
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: var(--color-text-secondary);
      }
    }

    @media (max-width: 768px) {
      .footer-links {
        gap: 12px;
      }

      .footer-links__title {
        font-size: 12px;
      }

      .footer-links__link {
        font-size: 12px;
      }
    }
  `,
})
export class FooterLinkColumnComponent {
  title = input.required<string>();
  links = input.required<FooterLink[]>();
}
