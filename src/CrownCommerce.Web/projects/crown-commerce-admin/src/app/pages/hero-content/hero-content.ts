import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-hero-content',
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
  templateUrl: './hero-content.html',
  styleUrl: './hero-content.scss',
})
export class HeroContentPage {
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);

  // Form fields
  heroTitle = '';
  heroSubtitle = '';
  ctaButtonText = '';
  ctaButtonLink = '';

  // Store original values for reset
  private originalValues = {
    heroTitle: '',
    heroSubtitle: '',
    ctaButtonText: '',
    ctaButtonLink: '',
  };

  // TODO: Load hero content from API when endpoint exists
  // ngOnInit() {
  //   this.contentService.getPage('hero').subscribe({
  //     next: (page) => { ... populate fields ... },
  //   });
  // }

  onReset() {
    this.heroTitle = this.originalValues.heroTitle;
    this.heroSubtitle = this.originalValues.heroSubtitle;
    this.ctaButtonText = this.originalValues.ctaButtonText;
    this.ctaButtonLink = this.originalValues.ctaButtonLink;
    this.imagePreviewUrl.set(null);
  }

  onSave() {
    this.saving.set(true);
    this.error.set(null);

    // TODO: Replace with actual API call when hero content endpoint exists
    // e.g., this.contentService.saveHeroContent({ heroTitle, heroSubtitle, ctaButtonText, ctaButtonLink })
    setTimeout(() => {
      this.originalValues = {
        heroTitle: this.heroTitle,
        heroSubtitle: this.heroSubtitle,
        ctaButtonText: this.ctaButtonText,
        ctaButtonLink: this.ctaButtonLink,
      };
      this.saving.set(false);
    }, 500);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('File must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload file via API when endpoint exists
    // this.schedulingService.uploadFile(file, employeeId).subscribe(...)
  }

  triggerFileUpload(fileInput: HTMLInputElement) {
    fileInput.click();
  }
}
