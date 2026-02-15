import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent, SectionHeaderComponent, ButtonComponent } from 'components';
import { CatalogService } from 'api';
import type { HairProduct } from 'api';

@Component({
  selector: 'feat-shop-page',
  standalone: true,
  imports: [ProductCardComponent, SectionHeaderComponent, ButtonComponent],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.scss',
})
export class ShopPage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly allProducts = signal<HairProduct[]>([]);
  readonly filteredProducts = signal<HairProduct[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly activeCategory = signal<string | null>(null);
  readonly activeTexture = signal<string | null>(null);
  readonly activeOrigin = signal<string | null>(null);
  readonly sortBy = signal<string>('name');

  readonly categories = ['Bundle', 'Closure', 'Frontal', 'Wig'];
  readonly textures = ['Straight', 'Wavy', 'Curly', 'Kinky'];
  readonly origins = ['Cambodia', 'Indonesia', 'India', 'Vietnam', 'Myanmar'];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.activeCategory.set(this.capitalizeFirst(params['category']));
      }
    });
    this.loadProducts();
  }

  filterByCategory(category: string | null): void {
    this.activeCategory.set(category);
    this.applyFilters();
  }

  filterByTexture(texture: string | null): void {
    this.activeTexture.set(texture);
    this.applyFilters();
  }

  filterByOrigin(origin: string | null): void {
    this.activeOrigin.set(origin);
    this.applyFilters();
  }

  sortProducts(sort: string): void {
    this.sortBy.set(sort);
    this.applyFilters();
  }

  navigateToProduct(product: HairProduct): void {
    this.router.navigate(['/product', product.id]);
  }

  formatPrice(product: HairProduct): string {
    return `$${product.price} CAD`;
  }

  private loadProducts(): void {
    this.catalogService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.loading.set(false);
      },
    });
  }

  private applyFilters(): void {
    let products = [...this.allProducts()];

    const category = this.activeCategory();
    if (category) {
      products = products.filter(p => p.type.toLowerCase() === category.toLowerCase());
    }

    const texture = this.activeTexture();
    if (texture) {
      products = products.filter(p => p.texture.toLowerCase() === texture.toLowerCase());
    }

    const origin = this.activeOrigin();
    if (origin) {
      products = products.filter(p => p.originCountry.toLowerCase() === origin.toLowerCase());
    }

    const sort = this.sortBy();
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.filteredProducts.set(products);
  }

  private capitalizeFirst(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
}
