import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Inquiry {
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
}

@Component({
  selector: 'app-inquiries-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './inquiries-list.html',
  styleUrl: './inquiries-list.scss',
})
export class InquiriesListPage {
  displayedColumns = ['name', 'email', 'phone', 'message', 'date', 'actions'];

  inquiries: Inquiry[] = [
    { name: 'Sarah Robinson', email: 'sarah.r@email.com', phone: '(416) 555-0123', message: 'Interested in Cambodian bundles', date: 'Feb 8' },
    { name: 'Maya Thompson', email: 'maya.t@email.com', phone: '(905) 555-0456', message: 'Question about wig customization', date: 'Feb 7' },
    { name: 'Jessica Chen', email: 'jessica.c@salon.com', phone: '(647) 555-0789', message: 'Bulk order pricing for salon', date: 'Feb 6' },
    { name: 'Aisha Williams', email: 'aisha.w@email.com', phone: '(416) 555-0321', message: 'Shipping timeline for frontals', date: 'Feb 5' },
  ];
}
