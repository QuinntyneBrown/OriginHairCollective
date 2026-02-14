import { Component, input } from '@angular/core';

export interface SocialLink {
  platform: 'instagram' | 'tiktok' | 'email';
  href: string;
}

@Component({
  selector: 'lib-social-icons',
  template: `
    <div class="social-icons">
      @for (link of links(); track link.platform) {
        <a class="social-icons__link" [href]="link.href" [attr.aria-label]="link.platform">
          @switch (link.platform) {
            @case ('instagram') {
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            }
            @case ('tiktok') {
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            }
            @case ('email') {
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            }
          }
        </a>
      }
    </div>
  `,
  styles: `
    .social-icons {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .social-icons__link {
      display: flex;
      align-items: center;
      color: var(--color-text-secondary);
      transition: color 0.2s ease;

      &:hover {
        color: var(--color-gold);
      }
    }

    @media (max-width: 768px) {
      .social-icons {
        gap: 16px;
      }

      .social-icons__link svg {
        width: 20px;
        height: 20px;
      }
    }
  `,
})
export class SocialIconsComponent {
  links = input.required<SocialLink[]>();
}
