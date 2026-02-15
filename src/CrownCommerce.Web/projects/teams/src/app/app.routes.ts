import { Routes } from '@angular/router';
import { TeamsLayout } from './layout/teams-layout';

export const routes: Routes = [
  {
    path: '',
    component: TeamsLayout,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home').then((m) => m.HomePage),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./pages/chat/chat').then((m) => m.ChatPage),
      },
      {
        path: 'meetings',
        loadComponent: () =>
          import('./pages/meetings/meetings').then((m) => m.MeetingsPage),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./pages/team-members/team-members').then((m) => m.TeamMembersPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
