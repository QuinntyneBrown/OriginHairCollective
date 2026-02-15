import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-teams-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './teams-layout.html',
  styleUrl: './teams-layout.scss',
})
export class TeamsLayout {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navItems: NavItem[] = [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'chat', label: 'Chat', route: '/chat' },
    { icon: 'calendar_month', label: 'Meetings', route: '/meetings' },
    { icon: 'group', label: 'Team', route: '/team' },
  ];

  private readonly breakpoint$ = this.breakpointObserver.observe([
    '(min-width: 1024px)',
    '(min-width: 768px) and (max-width: 1023px)',
  ]);

  private readonly breakpointResult = toSignal(
    this.breakpoint$.pipe(
      map((result) => {
        if (result.breakpoints['(min-width: 1024px)']) return 'desktop';
        if (result.breakpoints['(min-width: 768px) and (max-width: 1023px)']) return 'tablet';
        return 'mobile';
      })
    ),
    { initialValue: 'desktop' as const }
  );

  readonly isDesktop = computed(() => this.breakpointResult() === 'desktop');
  readonly isTablet = computed(() => this.breakpointResult() === 'tablet');
  readonly isMobile = computed(() => this.breakpointResult() === 'mobile');
}
