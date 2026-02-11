import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Testimonial {
  customer: string;
  rating: string;
  review: string;
  status: 'Published' | 'Pending';
  date: string;
}

@Component({
  selector: 'app-testimonials-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './testimonials-list.html',
  styleUrl: './testimonials-list.scss',
})
export class TestimonialsListPage {
  displayedColumns = ['customer', 'rating', 'review', 'status', 'date', 'actions'];

  testimonials: Testimonial[] = [
    { customer: 'Keisha Brown', rating: '5.0', review: "Best quality hair I've ever purchased!", status: 'Published', date: 'Feb 5' },
    { customer: 'Tamara Davis', rating: '4.5', review: 'Love the natural look and feel!', status: 'Published', date: 'Feb 3' },
    { customer: 'Nicole James', rating: '5.0', review: 'Amazing customer service and fast shipping', status: 'Pending', date: 'Jan 28' },
  ];
}
