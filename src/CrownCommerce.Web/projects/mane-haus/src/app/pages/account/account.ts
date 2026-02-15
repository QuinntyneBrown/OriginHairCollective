import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent } from 'components';
import { AuthService } from 'api';
import type { UserProfile } from 'api';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, ButtonComponent, SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class AccountPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
  });

  constructor() {
    this.title.setTitle('Account | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Manage your Mane Haus account.' });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.authService.user();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);
    this.error.set(false);
    this.authService.getProfile(user.userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  startEditing(): void {
    this.editing.set(true);
    this.saveSuccess.set(false);
  }

  cancelEditing(): void {
    this.editing.set(false);
    const p = this.profile();
    if (p) {
      this.form.patchValue({
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone ?? '',
      });
    }
  }

  saveProfile(): void {
    if (this.form.invalid) return;

    const user = this.authService.user();
    if (!user) return;

    this.saving.set(true);
    const value = this.form.getRawValue();
    this.authService.updateProfile(user.userId, {
      firstName: value.firstName!,
      lastName: value.lastName!,
      phone: value.phone || undefined,
    }).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.saving.set(false);
        this.editing.set(false);
        this.saveSuccess.set(true);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
