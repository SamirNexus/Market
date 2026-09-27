import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StoreSettingsService } from './store-settings.service';

describe('StoreSettingsService', () => {
  let service: StoreSettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(StoreSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads public merchant settings once', () => {
    service.load();
    service.load();

    const request = http.expectOne(
      'https://fakestoreapi.com/settings',
    );

    expect(request.request.method).toBe('GET');
    request.flush({
      id: 'default',
      storeName: 'Samir Market',
      supportEmail: null,
      currency: 'EUR',
      locale: 'en-US',
      logoUrl: null,
      primaryColor: '#123456',
      taxRate: 0.14,
      shippingFee: 8,
      freeShippingThreshold: 100,
      createdAt: '2026-09-27T00:00:00.000Z',
      updatedAt: '2026-09-27T00:00:00.000Z',
    });

    expect(service.current.storeName).toBe('Samir Market');
    expect(service.current.currency).toBe('EUR');
    expect(service.current.taxRate).toBe(0.14);
    expect(service.current.shippingFee).toBe(8);
  });

  it('keeps safe defaults when the settings request fails', () => {
    service.load();

    http.expectOne('https://fakestoreapi.com/settings').flush(
      { message: 'failed' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(service.current.storeName).toBe('Market');
    expect(service.current.currency).toBe('USD');
    expect(service.current.taxRate).toBe(0);
    expect(service.current.shippingFee).toBe(0);
  });
});
