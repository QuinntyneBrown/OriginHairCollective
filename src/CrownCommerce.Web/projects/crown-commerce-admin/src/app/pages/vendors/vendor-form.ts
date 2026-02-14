import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { VendorService, type VendorDetail } from 'api';

@Component({
  selector: 'app-vendor-form',
  imports: [
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
  ],
  templateUrl: './vendor-form.html',
  styleUrl: './vendor-form.scss',
})
export class VendorFormPage implements OnInit {
  private readonly vendorService = inject(VendorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEdit = signal(false);
  readonly vendorId = signal<string | null>(null);

  platforms = ['Alibaba', 'MadeInChina', 'OnesixEightEight', 'DHgate', 'GlobalSources', 'IndiaMART', 'TradeIndia', 'CantonFair', 'TradeShow', 'Direct', 'Other'];
  countries = ['China', 'India', 'Cambodia', 'Vietnam', 'Brazil', 'Myanmar', 'Other'];
  statuses = ['Pending', 'Evaluating', 'Approved', 'Rejected', 'TrialOrder'];

  form = {
    companyName: '',
    platform: '',
    contactName: '',
    contactEmail: '',
    contactWhatsApp: '',
    factoryLocation: '',
    hairOriginCountry: '',
    websiteUrl: '',
    evaluatedBy: '',
    notes: '',
    status: 'Pending',
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.vendorId.set(id);
      this.vendorService.getVendor(id).subscribe({
        next: (vendor) => this.populateForm(vendor),
      });
    }
  }

  save() {
    if (this.isEdit()) {
      this.vendorService.updateVendor(this.vendorId()!, {
        companyName: this.form.companyName,
        platform: this.form.platform,
        contactName: this.form.contactName,
        contactEmail: this.form.contactEmail,
        contactWhatsApp: this.form.contactWhatsApp || undefined,
        factoryLocation: this.form.factoryLocation || undefined,
        hairOriginCountry: this.form.hairOriginCountry,
        websiteUrl: this.form.websiteUrl || undefined,
        evaluatedBy: this.form.evaluatedBy || undefined,
        notes: this.form.notes || undefined,
        status: this.form.status,
      }).subscribe({
        next: () => this.router.navigate(['/vendors']),
      });
    } else {
      this.vendorService.createVendor({
        companyName: this.form.companyName,
        platform: this.form.platform,
        contactName: this.form.contactName,
        contactEmail: this.form.contactEmail,
        contactWhatsApp: this.form.contactWhatsApp || undefined,
        factoryLocation: this.form.factoryLocation || undefined,
        hairOriginCountry: this.form.hairOriginCountry,
        websiteUrl: this.form.websiteUrl || undefined,
        evaluatedBy: this.form.evaluatedBy || undefined,
        notes: this.form.notes || undefined,
      }).subscribe({
        next: () => this.router.navigate(['/vendors']),
      });
    }
  }

  private populateForm(vendor: VendorDetail) {
    this.form.companyName = vendor.companyName;
    this.form.platform = vendor.platform;
    this.form.contactName = vendor.contactName;
    this.form.contactEmail = vendor.contactEmail;
    this.form.contactWhatsApp = vendor.contactWhatsApp ?? '';
    this.form.factoryLocation = vendor.factoryLocation ?? '';
    this.form.hairOriginCountry = vendor.hairOriginCountry;
    this.form.websiteUrl = vendor.websiteUrl ?? '';
    this.form.evaluatedBy = vendor.evaluatedBy ?? '';
    this.form.notes = vendor.notes ?? '';
    this.form.status = vendor.status;
  }
}
