import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  shareReplay,
  tap,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AdminUser, AuthResponse } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessTokenValue: string | null = null;
  private readonly userSubject = new BehaviorSubject<AdminUser | null>(null);
  private refreshRequest$?: Observable<AuthResponse>;

  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get accessToken(): string | null {
    return this.accessTokenValue;
  }

  get currentUser(): AdminUser | null {
    return this.userSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/auth/login`,
      { email, password },
      { withCredentials: true },
    ).pipe(
      tap((response) => this.applySession(response)),
    );
  }

  refresh(): Observable<AuthResponse> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    ).pipe(
      tap((response) => this.applySession(response)),
      finalize(() => {
        this.refreshRequest$ = undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.refreshRequest$;
  }

  ensureAuthenticated(): Observable<boolean> {
    if (this.accessTokenValue && this.userSubject.value) {
      return of(true);
    }

    return this.refresh().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post(
      `${environment.apiBaseUrl}/auth/logout`,
      {},
      {
        withCredentials: true,
        responseType: 'json',
      },
    ).pipe(
      map(() => undefined),
      finalize(() => this.clearSession()),
    );
  }

  clearSession(): void {
    this.accessTokenValue = null;
    this.userSubject.next(null);
  }

  private applySession(response: AuthResponse): void {
    this.accessTokenValue = response.accessToken;
    this.userSubject.next(response.user);
  }
}
