import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminCart, CartsService } from './carts.service';

describe('CartsService', () => {
  let service: CartsService;
  let http: HttpTestingController;

  const cart: AdminCart = {
    id: 1,
    userId: 3,
    date: '2026-09-01',
    products: [{ productId: 1, quantity: 2 }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CartsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads carts without undefined filter parameters', () => {
    service.getAllCarts().subscribe();

    const request = http.expectOne((req) => req.url === 'https://fakestoreapi.com/carts');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    request.flush([cart]);
  });

  it('adds supplied date filters', () => {
    service.getAllCarts({ start: '2026-09-01', end: '2026-09-30' }).subscribe();

    const request = http.expectOne((req) => req.url === 'https://fakestoreapi.com/carts');
    expect(request.request.params.get('startDate')).toBe('2026-09-01');
    expect(request.request.params.get('endDate')).toBe('2026-09-30');
    request.flush([cart]);
  });

  it('deletes a cart by id', () => {
    service.deleteCart(1).subscribe();

    const request = http.expectOne('https://fakestoreapi.com/carts/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(cart);
  });
});
