import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/coming-soon/coming-soon').then((m) => m.ComingSoonPage),
  },
];
