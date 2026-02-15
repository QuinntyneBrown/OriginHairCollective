import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { SectionHeaderComponent, ProductCardComponent } from 'components';
import { CatalogService } from 'api';
import type { HairProduct } from 'api';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';

@Component({
  selector: 'app-collection',
  imports: [RouterLink, SectionHeaderComponent, ProductCardComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
})
export class CollectionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly allProducts = signal<HairProduct[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly activeCategory = signal<string>('all');

  readonly categories = ['all', 'bundles', 'closures', 'frontals', 'wigs'];

  readonly filteredProducts = computed(() => {
    const cat = this.activeCategory();
    const products = this.allProducts();
    if (cat === 'all') return products;
    return products.filter(p => p.type.toLowerCase() === cat || p.type.toLowerCase().includes(cat.replace(/s$/, '')));
  });

  ngOnInit(): void {
    this.title.setTitle('Collection | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Browse our premium collection of virgin hair bundles, closures, frontals, and wigs.' });

    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      if (category) {
        this.activeCategory.set(category);
      }
    });

    this.loadProducts();
  }

  formatPrice(price: number): string {
    return `FROM $${price}`;
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalogService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
