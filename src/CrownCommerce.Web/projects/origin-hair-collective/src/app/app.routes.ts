import { Routes } from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { CONTENT_PAGE_SLUG } from 'features';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
      },
      {
        path: 'shop',
        loadComponent: () => import('features').then(m => m.ShopPage),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('features').then(m => m.ProductDetailPage),
      },
      {
        path: 'cart',
        loadComponent: () => import('features').then(m => m.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () => import('features').then(m => m.CheckoutPage),
      },
      {
        path: 'contact',
        loadComponent: () => import('features').then(m => m.ContactPage),
      },
      {
        path: 'faq',
        loadComponent: () => import('features').then(m => m.FaqPage),
      },
      {
        path: 'shipping-info',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'shipping-information' }],
      },
      {
        path: 'returns',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'returns-policy' }],
      },
      {
        path: 'hair-care-guide',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'hair-care-guide' }],
      },
      {
        path: 'about',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'our-story' }],
      },
      {
        path: 'wholesale',
        loadComponent: () => import('features').then(m => m.WholesalePage),
      },
      {
        path: 'ambassador',
        loadComponent: () => import('features').then(m => m.AmbassadorPage),
      },
      {
        path: '**',
        loadComponent: () => import('features').then(m => m.NotFoundPage),
      },
    ],
  },
];
