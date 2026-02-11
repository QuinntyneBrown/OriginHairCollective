import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Product {
  name: string;
  type: string;
  texture: string;
  length: string;
  price: string;
  origin: string;
}

@Component({
  selector: 'app-products-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsListPage {
  displayedColumns = ['name', 'type', 'texture', 'length', 'price', 'origin', 'actions'];

  products: Product[] = [
    { name: 'Cambodian Straight Bundle', type: 'Bundle', texture: 'Straight', length: '18"', price: '$185.00', origin: 'Cambodia' },
    { name: 'Indian Curly Bundle', type: 'Bundle', texture: 'Curly', length: '24"', price: '$175.00', origin: 'India' },
    { name: 'Vietnamese Wavy Wig', type: 'Wig', texture: 'Wavy', length: '20"', price: '$450.00', origin: 'Vietnam' },
    { name: 'Indonesian Body Wave', type: 'Bundle', texture: 'Wavy', length: '22"', price: '$210.00', origin: 'Indonesia' },
    { name: 'Myanmar Kinky Closure', type: 'Closure', texture: 'Kinky', length: '16"', price: '$130.00', origin: 'Myanmar' },
  ];
}
