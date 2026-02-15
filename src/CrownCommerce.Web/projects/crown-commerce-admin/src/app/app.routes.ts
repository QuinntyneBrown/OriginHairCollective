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
        path: 'products/:id/edit',
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
        path: 'origins/new',
        loadComponent: () =>
          import('./pages/origins/origin-form').then(
            (m) => m.OriginFormPage
          ),
      },
      {
        path: 'origins/:id/edit',
        loadComponent: () =>
          import('./pages/origins/origin-form').then(
            (m) => m.OriginFormPage
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
        path: 'employees',
        loadComponent: () =>
          import('./pages/employees/employees-list').then(
            (m) => m.EmployeesListPage
          ),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./pages/schedule/schedule-calendar').then(
            (m) => m.ScheduleCalendarPage
          ),
      },
      {
        path: 'meetings/new',
        loadComponent: () =>
          import('./pages/meetings/meeting-form').then(
            (m) => m.MeetingFormPage
          ),
      },
      {
        path: 'meetings/:id/edit',
        loadComponent: () =>
          import('./pages/meetings/meeting-form').then(
            (m) => m.MeetingFormPage
          ),
      },
      {
        path: 'conversations',
        loadComponent: () =>
          import('./pages/schedule-conversations/conversations-list').then(
            (m) => m.ConversationsListPage
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
