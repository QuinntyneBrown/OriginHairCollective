import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
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
        path: 'subscribers',
        loadComponent: () =>
          import('./pages/subscribers/subscribers-list').then(
            (m) => m.SubscribersListPage
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
        path: 'vendors',
        loadComponent: () =>
          import('./pages/vendors/vendors-list').then(
            (m) => m.VendorsListPage
          ),
      },
      {
        path: 'vendors/new',
        loadComponent: () =>
          import('./pages/vendors/vendor-form').then(
            (m) => m.VendorFormPage
          ),
      },
      {
        path: 'vendors/:id',
        loadComponent: () =>
          import('./pages/vendors/vendor-detail').then(
            (m) => m.VendorDetailPage
          ),
      },
      {
        path: 'vendors/:id/edit',
        loadComponent: () =>
          import('./pages/vendors/vendor-form').then(
            (m) => m.VendorFormPage
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
