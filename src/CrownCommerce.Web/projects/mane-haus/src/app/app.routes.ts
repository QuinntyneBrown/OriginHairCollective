import { Routes } from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
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
      // Collection & Products
      {
        path: 'collection',
        loadComponent: () => import('features').then(m => m.ShopPage),
      },
      {
        path: 'collection/:category',
        loadComponent: () => import('features').then(m => m.ShopPage),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('features').then(m => m.ProductDetailPage),
      },
      // Content Pages
      {
        path: 'our-story',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'our-story' }],
      },
      {
        path: 'hair-care',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'hair-care-guide' }],
      },
      {
        path: 'shipping',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'shipping-information' }],
      },
      {
        path: 'returns',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'returns-policy' }],
      },
      {
        path: 'ambassador',
        loadComponent: () => import('features').then(m => m.AmbassadorPage),
      },
      // Info Pages
      {
        path: 'contact',
        loadComponent: () => import('features').then(m => m.ContactPage),
      },
      {
        path: 'faq',
        loadComponent: () => import('features').then(m => m.FaqPage),
      },
      {
        path: 'wholesale',
        loadComponent: () => import('features').then(m => m.WholesalePage),
      },
      // Auth Pages (app-specific)
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.RegisterPage),
      },
      {
        path: 'account',
        loadComponent: () => import('./pages/account/account').then(m => m.AccountPage),
        canActivate: [authGuard],
      },
      {
        path: 'account/orders',
        loadComponent: () => import('./pages/order-history/order-history').then(m => m.OrderHistoryPage),
        canActivate: [authGuard],
      },
      // E-Commerce
      {
        path: 'cart',
        loadComponent: () => import('features').then(m => m.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () => import('features').then(m => m.CheckoutPage),
      },
      {
        path: 'order/:id',
        loadComponent: () => import('./pages/order-detail/order-detail').then(m => m.OrderDetailPage),
        canActivate: [authGuard],
      },
      // Newsletter
      {
        path: 'newsletter/confirm',
        loadComponent: () => import('./pages/newsletter-confirm/newsletter-confirm').then(m => m.NewsletterConfirmPage),
      },
      {
        path: 'newsletter/unsubscribe',
        loadComponent: () => import('./pages/newsletter-unsubscribe/newsletter-unsubscribe').then(m => m.NewsletterUnsubscribePage),
      },
      // Catch-all
      {
        path: '**',
        loadComponent: () => import('features').then(m => m.NotFoundPage),
      },
    ],
  },
];
