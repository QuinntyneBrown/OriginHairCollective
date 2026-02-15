import { Routes } from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

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
        loadComponent: () => import('./pages/collection/collection').then(m => m.CollectionPage),
      },
      {
        path: 'collection/:category',
        loadComponent: () => import('./pages/collection/collection').then(m => m.CollectionPage),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailPage),
      },
      // Content Pages
      {
        path: 'our-story',
        loadComponent: () => import('./pages/content-page/content-page').then(m => m.ContentPageComponent),
      },
      {
        path: 'hair-care',
        loadComponent: () => import('./pages/content-page/content-page').then(m => m.ContentPageComponent),
      },
      {
        path: 'shipping',
        loadComponent: () => import('./pages/content-page/content-page').then(m => m.ContentPageComponent),
      },
      {
        path: 'returns',
        loadComponent: () => import('./pages/content-page/content-page').then(m => m.ContentPageComponent),
      },
      {
        path: 'ambassador',
        loadComponent: () => import('./pages/content-page/content-page').then(m => m.ContentPageComponent),
      },
      // Info Pages
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.ContactPage),
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq').then(m => m.FaqPage),
      },
      {
        path: 'wholesale',
        loadComponent: () => import('./pages/wholesale/wholesale').then(m => m.WholesalePage),
      },
      // Auth Pages
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
        loadComponent: () => import('./pages/cart/cart').then(m => m.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutPage),
        canActivate: [authGuard],
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
    ],
  },
];
