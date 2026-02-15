import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { AuthService } from 'api';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, SectionHeaderComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    this.title.setTitle('Login | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Sign in to your Mane Haus account.' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const value = this.form.getRawValue();
    this.authService.login({
      email: value.email!,
      password: value.password!,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/account']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'Invalid email or password.'
            : 'Something went wrong. Please try again.'
        );
      },
    });
  }
}
