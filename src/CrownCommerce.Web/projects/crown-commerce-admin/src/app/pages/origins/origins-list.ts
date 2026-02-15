import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { CatalogService, type HairOrigin } from 'api';
import { ConfirmDialog } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-origins-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './origins-list.html',
  styleUrl: './origins-list.scss',
})
export class OriginsListPage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly dialog = inject(MatDialog);
  readonly origins = signal<HairOrigin[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  displayedColumns = ['country', 'region', 'description', 'actions'];

  readonly filteredOrigins = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.origins();
    return this.origins().filter(o =>
      o.country?.toLowerCase().includes(term) ||
      o.region?.toLowerCase().includes(term) ||
      o.description?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadOrigins();
  }

  loadOrigins() {
    this.catalogService.getOrigins().subscribe({
      next: (data) => {
        this.origins.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load origins');
        this.loading.set(false);
      },
    });
  }

  deleteOrigin(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Origin',
        message: 'Are you sure you want to delete this origin? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.catalogService.deleteOrigin(id).subscribe({
        next: () => this.loadOrigins(),
        error: () => this.error.set('Failed to delete origin'),
      });
    });
  }
}
