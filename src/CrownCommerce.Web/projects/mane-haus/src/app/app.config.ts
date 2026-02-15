import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApi, authInterceptor } from 'api';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideApi({ baseUrl: environment.apiBaseUrl }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ]
};
