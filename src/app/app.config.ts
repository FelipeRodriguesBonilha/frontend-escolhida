import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { NGX_CURRENCY_CONFIG } from 'ngx-currency';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: NGX_CURRENCY_CONFIG,
      useValue: {
        align: 'left',
        allowNegative: false,
        allowZero: true,
        decimal: ',',
        precision: 2,
        prefix: 'R$ ',
        suffix: '',
        thousands: '.',
        nullable: false
      }
    }
  ]
};
