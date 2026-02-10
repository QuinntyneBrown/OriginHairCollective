import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero';
import { ProductShowcaseComponent } from './components/product-showcase/product-showcase';
import { AboutComponent } from './components/about/about';
import { ContactComponent } from './components/contact/contact';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent, ProductShowcaseComponent, AboutComponent, ContactComponent],
  template: `
    <app-hero />
    <app-product-showcase />
    <app-about />
    <app-contact />
    <footer class="site-footer">
      <p>&copy; 2026 The Origin Hair Collective. All rights reserved.</p>
    </footer>
  `,
  styles: `
    .site-footer {
      text-align: center;
      padding: 2rem;
      background: #3b1f0b;
      color: #a67c52;
      font-size: 0.9rem;
    }
  `,
})
export class AppComponent {}
