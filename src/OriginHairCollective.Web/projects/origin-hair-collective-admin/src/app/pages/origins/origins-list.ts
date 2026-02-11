import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Origin {
  country: string;
  region: string;
  description: string;
  products: number;
}

@Component({
  selector: 'app-origins-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './origins-list.html',
  styleUrl: './origins-list.scss',
})
export class OriginsListPage {
  displayedColumns = ['country', 'region', 'description', 'products', 'actions'];

  origins: Origin[] = [
    { country: 'Cambodia', region: 'Phnom Penh', description: 'Naturally thick, durable hair', products: 12 },
    { country: 'India', region: 'Chennai, Tamil Nadu', description: 'Versatile, temple-sourced hair', products: 8 },
    { country: 'Vietnam', region: 'Ho Chi Minh City', description: 'Strong, naturally straight hair', products: 10 },
    { country: 'Indonesia', region: 'Jakarta', description: 'Silky texture, slight wave', products: 9 },
    { country: 'Myanmar', region: 'Yangon', description: 'Soft, lightweight hair', products: 8 },
  ];
}
