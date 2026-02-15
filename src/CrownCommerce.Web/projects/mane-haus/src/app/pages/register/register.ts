import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { AuthService } from 'api';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, SectionHeaderComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    phone: [''],
  }, { validators: this.passwordMatchValidator });

  constructor() {
    this.title.setTitle('Register | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Create a Mane Haus account to shop and track your orders.' });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    if (password && confirm && password.value !== confirm.value) {
      confirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const value = this.form.getRawValue();
    this.authService.register({
      firstName: value.firstName!,
      lastName: value.lastName!,
      email: value.email!,
      password: value.password!,
      phone: value.phone || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/account']);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Registration failed. Please try again.');
      },
    });
  }
}
