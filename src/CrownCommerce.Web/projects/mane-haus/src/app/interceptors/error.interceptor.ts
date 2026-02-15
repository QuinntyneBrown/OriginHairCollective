import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { type HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case 401:
          router.navigate(['/login']);
          break;
        case 404:
          console.error(`Resource not found: ${req.url}`);
          break;
        case 500:
          console.error(`Server error: ${req.url}`);
          break;
      }
      return throwError(() => error);
    }),
  );
};
