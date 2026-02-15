import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CatalogService } from 'api';

@Component({
  selector: 'app-origin-form',
  imports: [
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './origin-form.html',
  styleUrl: './origin-form.scss',
})
export class OriginFormPage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEditMode = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  country = '';
  region = '';
  description = '';

  private originId: string | null = null;

  ngOnInit() {
    this.originId = this.route.snapshot.paramMap.get('id');
    if (this.originId) {
      this.isEditMode.set(true);
      this.loadOrigin(this.originId);
    }
  }

  loadOrigin(id: string) {
    this.loading.set(true);
    this.catalogService.getOrigin(id).subscribe({
      next: (origin) => {
        this.country = origin.country;
        this.region = origin.region;
        this.description = origin.description;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load origin');
        this.loading.set(false);
      },
    });
  }

  get isFormValid(): boolean {
    return !!(this.country.trim() && this.region.trim());
  }

  onSubmit() {
    if (!this.isFormValid) return;

    this.saving.set(true);
    this.error.set(null);

    const request = {
      country: this.country.trim(),
      region: this.region.trim(),
      description: this.description.trim(),
    };

    const operation = this.isEditMode()
      ? this.catalogService.updateOrigin(this.originId!, request)
      : this.catalogService.createOrigin(request);

    operation.subscribe({
      next: () => this.router.navigate(['/origins']),
      error: () => {
        this.error.set(`Failed to ${this.isEditMode() ? 'update' : 'create'} origin`);
        this.saving.set(false);
      },
    });
  }
}
