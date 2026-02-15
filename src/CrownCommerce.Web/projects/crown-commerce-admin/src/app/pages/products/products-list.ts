import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { CatalogService, type HairProduct } from 'api';
import { ConfirmDialog } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-products-list',
  imports: [
    RouterLink,
    CurrencyPipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsListPage implements OnInit {
  protected readonly Math = Math;
  private readonly catalogService = inject(CatalogService);
  private readonly dialog = inject(MatDialog);
  readonly products = signal<HairProduct[]>([]);
  readonly searchTerm = signal('');
  readonly selectedType = signal<string | null>(null);
  readonly selectedOrigin = signal<string | null>(null);
  readonly selectedTexture = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  displayedColumns = ['name', 'type', 'texture', 'length', 'price', 'origin', 'actions'];

  readonly pageIndex = signal(0);
  readonly pageSize = 10;

  readonly uniqueTypes = computed(() => [...new Set(this.products().map(p => p.type).filter(Boolean))].sort());
  readonly uniqueOrigins = computed(() => [...new Set(this.products().map(p => p.originCountry).filter(Boolean))].sort());
  readonly uniqueTextures = computed(() => [...new Set(this.products().map(p => p.texture).filter(Boolean))].sort());

  readonly filteredProducts = computed(() => {
    let result = this.products();
    const term = this.searchTerm().toLowerCase();
    const type = this.selectedType();
    const origin = this.selectedOrigin();
    const texture = this.selectedTexture();

    if (term) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.type?.toLowerCase().includes(term) ||
        p.texture?.toLowerCase().includes(term) ||
        p.originCountry?.toLowerCase().includes(term)
      );
    }
    if (type) result = result.filter(p => p.type === type);
    if (origin) result = result.filter(p => p.originCountry === origin);
    if (texture) result = result.filter(p => p.texture === texture);

    return result;
  });

  setTypeFilter(type: string | null) {
    this.selectedType.set(type);
    this.pageIndex.set(0);
  }

  setOriginFilter(origin: string | null) {
    this.selectedOrigin.set(origin);
    this.pageIndex.set(0);
  }

  setTextureFilter(texture: string | null) {
    this.selectedTexture.set(texture);
    this.pageIndex.set(0);
  }

  readonly paginatedProducts = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  previousPage() {
    if (this.pageIndex() > 0) this.pageIndex.update(i => i - 1);
  }

  nextPage() {
    if ((this.pageIndex() + 1) * this.pageSize < this.filteredProducts().length) {
      this.pageIndex.update(i => i + 1);
    }
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.catalogService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products');
        this.loading.set(false);
      },
    });
  }

  deleteProduct(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Product',
        message: 'Are you sure you want to delete this product? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.catalogService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: () => this.error.set('Failed to delete product'),
      });
    });
  }
}
