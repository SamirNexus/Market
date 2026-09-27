import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import type { MerchantSettings } from '@market/contracts/settings';
import { environment } from '../../../environments/environment';

const FALLBACK_SETTINGS: MerchantSettings = {
  id: 'default',
  storeName: 'Market',
  supportEmail: null,
  currency: 'USD',
  locale: 'en-US',
  logoUrl: null,
  primaryColor: '#111827',
  createdAt: '',
  updatedAt: '',
};

@Injectable({
  providedIn: 'root'
})
export class StoreSettingsService {
  private readonly subject = new BehaviorSubject<MerchantSettings>(
    FALLBACK_SETTINGS,
  );
  private loading = false;
  private loaded = false;

  readonly settings$: Observable<MerchantSettings> =
    this.subject.asObservable();

  readonly currency$ = this.settings$.pipe(
    map((settings) => settings.currency),
    distinctUntilChanged(),
  );

  constructor(private http: HttpClient) {}

  get current(): MerchantSettings {
    return this.subject.value;
  }

  load(): void {
    if (this.loading || this.loaded) return;

    this.loading = true;

    this.http.get<MerchantSettings>(
      `${environment.apiBaseUrl}/settings`,
    ).subscribe({
      next: (settings) => {
        this.subject.next(settings);
        this.loaded = true;
        this.loading = false;
        this.applyTheme(settings);
      },
      error: () => {
        this.loading = false;
        this.applyTheme(this.subject.value);
      },
    });
  }

  private applyTheme(settings: MerchantSettings): void {
    if (typeof document === 'undefined') return;

    document.documentElement.style.setProperty(
      '--market-primary',
      settings.primaryColor,
    );
  }
}
