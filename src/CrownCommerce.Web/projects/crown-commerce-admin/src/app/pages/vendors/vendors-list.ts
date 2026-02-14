import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VendorService, type Vendor } from 'api';

@Component({
  selector: 'app-vendors-list',
  imports: [
    RouterLink,
    DatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './vendors-list.html',
  styleUrl: './vendors-list.scss',
})
export class VendorsListPage implements OnInit {
  private readonly vendorService = inject(VendorService);
  readonly vendors = signal<Vendor[]>([]);
  displayedColumns = ['companyName', 'platform', 'country', 'status', 'score', 'rating', 'contact', 'actions'];

  ngOnInit() {
    this.vendorService.getVendors().subscribe({
      next: (data) => this.vendors.set(data),
    });
  }

  deleteVendor(id: string) {
    this.vendorService.deleteVendor(id).subscribe({
      next: () => {
        this.vendors.update((vendors) => vendors.filter((v) => v.id !== id));
      },
    });
  }
}
