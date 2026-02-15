import { Routes } from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';

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
        loadComponent: () => import('./pages/shop/shop').then(m => m.ShopPage),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailPage),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart').then(m => m.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutPage),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.ContactPage),
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq').then(m => m.FaqPage),
      },
      {
        path: 'shipping-info',
        loadComponent: () => import('./pages/shipping-info/shipping-info').then(m => m.ShippingInfoPage),
      },
      {
        path: 'returns',
        loadComponent: () => import('./pages/returns/returns').then(m => m.ReturnsPage),
      },
      {
        path: 'hair-care-guide',
        loadComponent: () => import('./pages/hair-care-guide/hair-care-guide').then(m => m.HairCareGuidePage),
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then(m => m.AboutPage),
      },
      {
        path: 'wholesale',
        loadComponent: () => import('./pages/wholesale/wholesale').then(m => m.WholesalePage),
      },
      {
        path: 'ambassador',
        loadComponent: () => import('./pages/ambassador/ambassador').then(m => m.AmbassadorPage),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundPage),
      },
    ],
  },
];
