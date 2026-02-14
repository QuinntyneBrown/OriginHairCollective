import { Component } from '@angular/core';
import {
  LogoComponent,
  DividerComponent,
  CountdownTimerComponent,
  EmailSignupComponent,
} from 'components';

@Component({
  selector: 'app-coming-soon',
  imports: [
    LogoComponent,
    DividerComponent,
    CountdownTimerComponent,
    EmailSignupComponent,
  ],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
})
export class ComingSoonPage {
  readonly launchDate = '2026-09-01T00:00:00';

  onEmailSubmitted(email: string) {
    console.log('Email submitted:', email);
  }
}
