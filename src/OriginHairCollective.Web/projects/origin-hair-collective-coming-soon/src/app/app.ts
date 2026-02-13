import { Component } from '@angular/core';
import {
  LogoComponent,
  DividerComponent,
  BadgeComponent,
  SocialIconsComponent,
  EmailSignupComponent,
  SocialLink,
} from 'components';

@Component({
  selector: 'app-root',
  imports: [
    LogoComponent,
    DividerComponent,
    BadgeComponent,
    SocialIconsComponent,
    EmailSignupComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/originhaircollective' },
    { platform: 'email', href: 'mailto:hello@originhaircollective.com' },
  ];

  onEmailSubmit(email: string): void {
    console.log('Email submitted:', email);
  }
}
