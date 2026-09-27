import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import {
  MerchantSettings,
  SettingsService,
  UpdateMerchantSettingsInput,
} from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  loading = false;
  saving = false;
  errorMessage = '';
  feedbackMessage = '';
  settings?: MerchantSettings;

  readonly form = this.build.group({
    storeName: ['', [Validators.required, Validators.maxLength(120)]],
    supportEmail: ['', [Validators.email, Validators.maxLength(254)]],
    currency: ['USD', [
      Validators.required,
      Validators.pattern(/^[A-Za-z]{3}$/),
    ]],
    locale: ['en-US', [
      Validators.required,
      Validators.pattern(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/),
    ]],
    logoUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
    primaryColor: ['#111827', [
      Validators.required,
      Validators.pattern(/^#[0-9A-Fa-f]{6}$/),
    ]],
    taxRatePercent: [0, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]],
    shippingFee: [0, [
      Validators.required,
      Validators.min(0),
    ]],
    freeShippingThreshold: [null as number | null, [
      Validators.min(0),
    ]],
  });

  constructor(
    private build: FormBuilder,
    private settingsService: SettingsService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get canEdit(): boolean {
    const role = this.auth.currentUser?.role;
    return role === 'ADMIN' || role === 'OWNER';
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.settingsService.get().pipe(
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: (settings) => {
        this.settings = settings;
        this.form.reset({
          storeName: settings.storeName,
          supportEmail: settings.supportEmail ?? '',
          currency: settings.currency,
          locale: settings.locale,
          logoUrl: settings.logoUrl ?? '',
          primaryColor: settings.primaryColor,
          taxRatePercent: settings.taxRate * 100,
          shippingFee: settings.shippingFee,
          freeShippingThreshold: settings.freeShippingThreshold,
        });
      },
      error: () => {
        this.errorMessage = 'Store settings could not be loaded.';
      },
    });
  }

  save(): void {
    if (!this.canEdit || this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const input: UpdateMerchantSettingsInput = {
      storeName: raw.storeName?.trim() || undefined,
      supportEmail: raw.supportEmail?.trim() || null,
      currency: raw.currency?.trim().toUpperCase() || undefined,
      locale: raw.locale?.trim() || undefined,
      logoUrl: raw.logoUrl?.trim() || null,
      primaryColor: raw.primaryColor?.trim() || undefined,
      taxRate: (raw.taxRatePercent ?? 0) / 100,
      shippingFee: raw.shippingFee ?? 0,
      freeShippingThreshold: raw.freeShippingThreshold ?? null,
    };

    this.saving = true;
    this.feedbackMessage = '';
    this.errorMessage = '';

    this.settingsService.update(input).pipe(
      finalize(() => {
        this.saving = false;
      }),
    ).subscribe({
      next: (settings) => {
        this.settings = settings;
        this.feedbackMessage = 'Store settings updated successfully.';
      },
      error: () => {
        this.errorMessage = 'Store settings could not be updated.';
      },
    });
  }
}
