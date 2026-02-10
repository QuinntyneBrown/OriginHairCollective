import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../services/catalog.service';
import { HairOrigin } from '../../models/hair-origin';
import { HairProduct } from '../../models/hair-product';

@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="showcase" id="products">
      <h2>Our Collection</h2>
      <p class="section-subtitle">Browse premium hair by origin</p>

      <div class="origin-tabs">
        <button
          *ngFor="let origin of origins"
          class="tab"
          [class.active]="selectedOrigin?.id === origin.id"
          (click)="selectOrigin(origin)">
          {{ origin.country }}
        </button>
      </div>

      <div class="origin-description" *ngIf="selectedOrigin">
        <p>{{ selectedOrigin.description }}</p>
      </div>

      <div class="products-grid">
        <div class="product-card" *ngFor="let product of filteredProducts">
          <div class="product-image-placeholder">
            <span class="product-type-badge">{{ product.type }}</span>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="product-meta">
              <span class="texture">{{ product.texture }}</span>
              <span class="length">{{ product.lengthInches }}"</span>
            </div>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-footer">
              <span class="price">\${{ product.price.toFixed(2) }}</span>
              <a href="#contact" class="inquire-btn">Inquire</a>
            </div>
          </div>
        </div>
      </div>

      <div class="no-products" *ngIf="filteredProducts.length === 0 && selectedOrigin">
        <p>No products found for this origin.</p>
      </div>
    </section>
  `,
  styles: `
    .showcase {
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    h2 {
      font-family: 'Georgia', serif;
      font-size: 2.5rem;
      color: #3b1f0b;
      margin-bottom: 0.5rem;
    }
    .section-subtitle {
      color: #6b3a1f;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
    .origin-tabs {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .tab {
      padding: 0.6rem 1.5rem;
      background: #f5f0eb;
      border: 2px solid #d4a85c;
      border-radius: 30px;
      cursor: pointer;
      font-size: 0.95rem;
      color: #3b1f0b;
      transition: all 0.3s;
    }
    .tab:hover { background: #f0e0c0; }
    .tab.active {
      background: #d4a85c;
      color: #fff;
    }
    .origin-description {
      max-width: 700px;
      margin: 0 auto 2rem;
      color: #555;
      font-style: italic;
      line-height: 1.6;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      text-align: left;
    }
    .product-card {
      border: 1px solid #e8ddd0;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.3s;
      background: #fff;
    }
    .product-card:hover {
      box-shadow: 0 4px 20px rgba(59, 31, 11, 0.15);
    }
    .product-image-placeholder {
      height: 200px;
      background: linear-gradient(135deg, #f5e6d3, #e8d5c0);
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 1rem;
    }
    .product-type-badge {
      background: #3b1f0b;
      color: #f5d5a0;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .product-info { padding: 1.2rem; }
    .product-info h3 {
      color: #3b1f0b;
      font-size: 1.15rem;
      margin-bottom: 0.5rem;
    }
    .product-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .texture, .length {
      font-size: 0.85rem;
      color: #888;
      background: #f5f0eb;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
    }
    .product-description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price {
      font-size: 1.3rem;
      font-weight: 700;
      color: #3b1f0b;
    }
    .inquire-btn {
      padding: 0.5rem 1.2rem;
      background: #d4a85c;
      color: #3b1f0b;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.3s;
    }
    .inquire-btn:hover { background: #e8c580; }
    .no-products { padding: 2rem; color: #888; }
  `,
})
export class ProductShowcaseComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);

  origins: HairOrigin[] = [];
  allProducts: HairProduct[] = [];
  filteredProducts: HairProduct[] = [];
  selectedOrigin: HairOrigin | null = null;

  ngOnInit(): void {
    this.catalogService.getOrigins().subscribe((origins) => {
      this.origins = origins;
      if (origins.length > 0) {
        this.selectOrigin(origins[0]);
      }
    });

    this.catalogService.getProducts().subscribe((products) => {
      this.allProducts = products;
      if (this.selectedOrigin) {
        this.filterProducts();
      }
    });
  }

  selectOrigin(origin: HairOrigin): void {
    this.selectedOrigin = origin;
    this.filterProducts();
  }

  private filterProducts(): void {
    if (!this.selectedOrigin) {
      this.filteredProducts = this.allProducts;
      return;
    }
    this.filteredProducts = this.allProducts.filter(
      (p) => p.originId === this.selectedOrigin!.id
    );
  }
}
