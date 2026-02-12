import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products-list').then(
            (m) => m.ProductsListPage
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./pages/products/product-form').then(
            (m) => m.ProductFormPage
          ),
      },
      {
        path: 'origins',
        loadComponent: () =>
          import('./pages/origins/origins-list').then(
            (m) => m.OriginsListPage
          ),
      },
      {
        path: 'inquiries',
        loadComponent: () =>
          import('./pages/inquiries/inquiries-list').then(
            (m) => m.InquiriesListPage
          ),
      },
      {
        path: 'testimonials',
        loadComponent: () =>
          import('./pages/testimonials/testimonials-list').then(
            (m) => m.TestimonialsListPage
          ),
      },
      {
        path: 'hero-content',
        loadComponent: () =>
          import('./pages/hero-content/hero-content').then(
            (m) => m.HeroContentPage
          ),
      },
      {
        path: 'trust-bar',
        loadComponent: () =>
          import('./pages/trust-bar/trust-bar-list').then(
            (m) => m.TrustBarListPage
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
