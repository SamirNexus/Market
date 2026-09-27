import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MerchantSettings, SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let http: HttpTestingController;

  const settings: MerchantSettings = {
    id: 'default',
    storeName: 'Market',
    supportEmail: null,
    currency: 'USD',
    locale: 'en-US',
    logoUrl: null,
    primaryColor: '#111827',
    taxRate: 0,
    shippingFee: 0,
    freeShippingThreshold: null,
    createdAt: '2026-09-27T00:00:00.000Z',
    updatedAt: '2026-09-27T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(SettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads protected merchant settings', () => {
    service.get().subscribe((result) => expect(result).toEqual(settings));

    const request = http.expectOne(
      'https://fakestoreapi.com/admin/settings',
    );
    expect(request.request.method).toBe('GET');
    request.flush(settings);
  });

  it('updates merchant settings with PATCH', () => {
    service.update({ storeName: 'Samir Market' }).subscribe();

    const request = http.expectOne(
      'https://fakestoreapi.com/admin/settings',
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      storeName: 'Samir Market',
    });
    request.flush({
      ...settings,
      storeName: 'Samir Market',
    });
  });
});
