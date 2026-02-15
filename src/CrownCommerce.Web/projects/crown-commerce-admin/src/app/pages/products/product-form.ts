import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CatalogService, type HairOrigin } from 'api';

@Component({
  selector: 'app-product-form',
  imports: [
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductFormPage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly origins = signal<HairOrigin[]>([]);
  readonly textures = ['Straight', 'Curly', 'Wavy', 'Kinky', 'Body Wave'];
  readonly types = ['Bundle', 'Wig', 'Closure', 'Frontal'];

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Form fields
  name = '';
  originId = '';
  texture = '';
  type = '';
  lengthInches: number | null = null;
  price: number | null = null;
  imageUrl = '';
  description = '';

  private productId: string | null = null;

  ngOnInit() {
    this.loadOrigins();

    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode.set(true);
      this.loadProduct(this.productId);
    }
  }

  loadOrigins() {
    this.catalogService.getOrigins().subscribe({
      next: (data) => this.origins.set(data),
      error: () => this.error.set('Failed to load origins'),
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.catalogService.getProduct(id).subscribe({
      next: (product) => {
        this.name = product.name;
        this.originId = product.originId;
        this.texture = product.texture;
        this.type = product.type;
        this.lengthInches = product.lengthInches;
        this.price = product.price;
        this.imageUrl = product.imageUrl ?? '';
        this.description = product.description;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load product');
        this.loading.set(false);
      },
    });
  }

  get isFormValid(): boolean {
    return !!(
      this.name.trim() &&
      this.originId &&
      this.type &&
      this.lengthInches != null && this.lengthInches > 0 &&
      this.price != null && this.price > 0
    );
  }

  onSubmit() {
    if (!this.isFormValid) return;

    this.saving.set(true);
    this.error.set(null);

    const request = {
      name: this.name.trim(),
      originId: this.originId,
      texture: this.texture,
      type: this.type,
      lengthInches: this.lengthInches!,
      price: this.price!,
      description: this.description.trim(),
      imageUrl: this.imageUrl.trim() || undefined,
    };

    const operation = this.isEditMode()
      ? this.catalogService.updateProduct(this.productId!, request)
      : this.catalogService.createProduct(request);

    operation.subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => {
        this.error.set(`Failed to ${this.isEditMode() ? 'update' : 'create'} product`);
        this.saving.set(false);
      },
    });
  }
}
