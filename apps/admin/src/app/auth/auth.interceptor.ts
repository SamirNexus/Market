import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import {
  catchError,
  switchMap,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith(environment.apiBaseUrl)) {
      return next.handle(request);
    }

    const isAuthRequest =
      request.url.includes('/auth/login')
      || request.url.includes('/auth/refresh')
      || request.url.includes('/auth/logout');

    let apiRequest = request.clone({ withCredentials: true });

    if (this.auth.accessToken && !isAuthRequest) {
      apiRequest = apiRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.accessToken}`,
        },
      });
    }

    return next.handle(apiRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status !== 401
          || isAuthRequest
          || !this.auth.accessToken
        ) {
          return throwError(() => error);
        }

        return this.auth.refresh().pipe(
          switchMap(() => {
            const token = this.auth.accessToken;

            if (!token) {
              throw error;
            }

            return next.handle(
              apiRequest.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              }),
            );
          }),
          catchError((refreshError) => {
            this.auth.clearSession();
            void this.router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }),
    );
  }
}
