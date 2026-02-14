import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import {
  VendorService,
  type VendorDetail,
  type VendorScore,
  type VendorRedFlag,
  type ScoreItem,
} from 'api';

interface ChecklistCriterion {
  section: string;
  criterionNumber: string;
  criterionLabel: string;
  maxScore: number;
  score: number;
  notes: string;
}

@Component({
  selector: 'app-vendor-detail',
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTableModule,
  ],
  templateUrl: './vendor-detail.html',
  styleUrl: './vendor-detail.scss',
})
export class VendorDetailPage implements OnInit {
  private readonly vendorService = inject(VendorService);
  private readonly route = inject(ActivatedRoute);

  readonly vendor = signal<VendorDetail | null>(null);
  readonly checklist = signal<ChecklistCriterion[]>(this.getDefaultChecklist());
  readonly redFlags = signal<{ description: string; isCleared: boolean }[]>([]);

  readonly followUpSubject = signal('');
  readonly followUpBody = signal('');
  readonly sendingFollowUp = signal(false);

  readonly sectionTotals = computed(() => {
    const items = this.checklist();
    const sections = [
      { key: 'ValueAndPricing', label: 'Value & Pricing', max: 50 },
      { key: 'SupplierCredibility', label: 'Supplier Credibility', max: 30 },
      { key: 'ProductRangeAndCustomization', label: 'Product Range & Customization', max: 20 },
      { key: 'LogisticsAndShipping', label: 'Logistics & Shipping to Canada', max: 20 },
      { key: 'AfterSaleAndRisk', label: 'After-Sale & Risk', max: 15 },
    ];
    return sections.map((s) => ({
      ...s,
      score: items.filter((i) => i.section === s.key).reduce((sum, i) => sum + i.score, 0),
    }));
  });

  readonly grandTotal = computed(() =>
    this.checklist().reduce((sum, i) => sum + i.score, 0)
  );

  readonly grandMax = computed(() =>
    this.checklist().reduce((sum, i) => sum + i.maxScore, 0)
  );

  readonly rating = computed(() => {
    const total = this.grandTotal();
    if (total >= 108) return 'Excellent';
    if (total >= 85) return 'Good';
    if (total >= 62) return 'Fair';
    return 'Poor';
  });

  readonly allRedFlagsCleared = computed(() =>
    this.redFlags().every((f) => f.isCleared)
  );

  followUpColumns = ['subject', 'sentAt', 'status'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vendorService.getVendor(id).subscribe({
        next: (vendor) => {
          this.vendor.set(vendor);
          if (vendor.scores.length > 0) {
            this.populateScores(vendor.scores);
          }
          if (vendor.redFlags.length > 0) {
            this.redFlags.set(vendor.redFlags.map((f) => ({
              description: f.description,
              isCleared: f.isCleared,
            })));
          }
        },
      });
    }
  }

  saveScores() {
    const vendorId = this.vendor()?.id;
    if (!vendorId) return;

    const scores: ScoreItem[] = this.checklist().map((c) => ({
      section: c.section,
      criterionNumber: c.criterionNumber,
      criterionLabel: c.criterionLabel,
      score: c.score,
      maxScore: c.maxScore,
      notes: c.notes || undefined,
    }));

    this.vendorService.saveScores(vendorId, { scores }).subscribe({
      next: () => this.reloadVendor(vendorId),
    });
  }

  saveRedFlags() {
    const vendorId = this.vendor()?.id;
    if (!vendorId) return;

    this.vendorService.saveRedFlags(vendorId, {
      redFlags: this.redFlags(),
    }).subscribe({
      next: () => this.reloadVendor(vendorId),
    });
  }

  sendFollowUp() {
    const vendorId = this.vendor()?.id;
    if (!vendorId) return;

    this.sendingFollowUp.set(true);
    this.vendorService.sendFollowUp(vendorId, {
      subject: this.followUpSubject(),
      body: this.followUpBody(),
    }).subscribe({
      next: () => {
        this.followUpSubject.set('');
        this.followUpBody.set('');
        this.sendingFollowUp.set(false);
        this.reloadVendor(vendorId);
      },
      error: () => this.sendingFollowUp.set(false),
    });
  }

  private reloadVendor(id: string) {
    this.vendorService.getVendor(id).subscribe({
      next: (vendor) => this.vendor.set(vendor),
    });
  }

  private populateScores(scores: VendorScore[]) {
    const checklist = this.checklist();
    for (const score of scores) {
      const match = checklist.find(
        (c) => c.section === score.section && c.criterionNumber === score.criterionNumber
      );
      if (match) {
        match.score = score.score;
        match.notes = score.notes ?? '';
      }
    }
    this.checklist.set([...checklist]);
  }

  private getDefaultChecklist(): ChecklistCriterion[] {
    return [
      { section: 'ValueAndPricing', criterionNumber: '1.1', criterionLabel: 'Price per bundle (18"-22")', maxScore: 10, score: 0, notes: '' },
      { section: 'ValueAndPricing', criterionNumber: '1.2', criterionLabel: 'Price per bundle (24"-30")', maxScore: 8, score: 0, notes: '' },
      { section: 'ValueAndPricing', criterionNumber: '1.3', criterionLabel: 'Minimum Order Quantity (MOQ)', maxScore: 8, score: 0, notes: '' },
      { section: 'ValueAndPricing', criterionNumber: '1.4', criterionLabel: 'Bulk discount tiers', maxScore: 6, score: 0, notes: '' },
      { section: 'ValueAndPricing', criterionNumber: '1.5', criterionLabel: 'Sample pricing & availability', maxScore: 6, score: 0, notes: '' },
      { section: 'ValueAndPricing', criterionNumber: '1.6', criterionLabel: 'Payment terms', maxScore: 6, score: 0, notes: '' },
      { section: 'ValueAndPricing', criterionNumber: '1.7', criterionLabel: 'Hidden cost transparency', maxScore: 6, score: 0, notes: '' },
      { section: 'SupplierCredibility', criterionNumber: '2.1', criterionLabel: 'Verified supplier status', maxScore: 6, score: 0, notes: '' },
      { section: 'SupplierCredibility', criterionNumber: '2.2', criterionLabel: 'Business tenure', maxScore: 6, score: 0, notes: '' },
      { section: 'SupplierCredibility', criterionNumber: '2.3', criterionLabel: 'Certifications', maxScore: 4, score: 0, notes: '' },
      { section: 'SupplierCredibility', criterionNumber: '2.4', criterionLabel: 'Reviews & transaction history', maxScore: 4, score: 0, notes: '' },
      { section: 'SupplierCredibility', criterionNumber: '2.5', criterionLabel: 'Factory vs. trading company', maxScore: 4, score: 0, notes: '' },
      { section: 'SupplierCredibility', criterionNumber: '2.6', criterionLabel: 'Reference customers', maxScore: 3, score: 0, notes: '' },
      { section: 'SupplierCredibility', criterionNumber: '2.7', criterionLabel: 'Responsive communication', maxScore: 3, score: 0, notes: '' },
      { section: 'ProductRangeAndCustomization', criterionNumber: '3.1', criterionLabel: 'Texture variety', maxScore: 5, score: 0, notes: '' },
      { section: 'ProductRangeAndCustomization', criterionNumber: '3.2', criterionLabel: 'Length range', maxScore: 4, score: 0, notes: '' },
      { section: 'ProductRangeAndCustomization', criterionNumber: '3.3', criterionLabel: 'Product types', maxScore: 4, score: 0, notes: '' },
      { section: 'ProductRangeAndCustomization', criterionNumber: '3.4', criterionLabel: 'Custom labeling / private label', maxScore: 4, score: 0, notes: '' },
      { section: 'ProductRangeAndCustomization', criterionNumber: '3.5', criterionLabel: 'Color options', maxScore: 3, score: 0, notes: '' },
      { section: 'LogisticsAndShipping', criterionNumber: '4.1', criterionLabel: 'Shipping cost (per kg to Canada)', maxScore: 5, score: 0, notes: '' },
      { section: 'LogisticsAndShipping', criterionNumber: '4.2', criterionLabel: 'Delivery time', maxScore: 5, score: 0, notes: '' },
      { section: 'LogisticsAndShipping', criterionNumber: '4.3', criterionLabel: 'Packaging quality for transit', maxScore: 3, score: 0, notes: '' },
      { section: 'LogisticsAndShipping', criterionNumber: '4.4', criterionLabel: 'Customs documentation', maxScore: 4, score: 0, notes: '' },
      { section: 'LogisticsAndShipping', criterionNumber: '4.5', criterionLabel: 'Duty-free eligibility', maxScore: 3, score: 0, notes: '' },
      { section: 'AfterSaleAndRisk', criterionNumber: '5.1', criterionLabel: 'Return / refund policy', maxScore: 4, score: 0, notes: '' },
      { section: 'AfterSaleAndRisk', criterionNumber: '5.2', criterionLabel: 'Defect resolution process', maxScore: 4, score: 0, notes: '' },
      { section: 'AfterSaleAndRisk', criterionNumber: '5.3', criterionLabel: 'Quality consistency (batch to batch)', maxScore: 4, score: 0, notes: '' },
      { section: 'AfterSaleAndRisk', criterionNumber: '5.4', criterionLabel: 'Dedicated account manager', maxScore: 3, score: 0, notes: '' },
    ];
  }
}
