import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from '../../products/models/product';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let service: CartsService;
  let http: HttpTestingController;

  const product: Product = {
    id: 'product-1',
    title: 'Test product',
    slug: 'test-product',
    sku: 'TEST-001',
    stock: 5,
    status: 'ACTIVE' as const,
    price: 99,
    category: 'electronics',
    description: 'Test description',
    image: 'https://example.com/product.jpg',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CartsService);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('adds a new item and updates the cart count', () => {
    expect(service.addItem(product, 2)).toBe('added');
    expect(service.items).toEqual([{ item: product, quantity: 2 }]);
    expect(service.count$.value).toBe(2);
  });

  it('updates quantity when the same product is added again', () => {
    service.addItem(product, 1);

    expect(service.addItem(product, 2)).toBe('updated');
    expect(service.items[0].quantity).toBe(3);
    expect(service.count$.value).toBe(3);
  });

  it('caps cart quantity at current stock', () => {
    service.addItem(product, 99);
    expect(service.items[0].quantity).toBe(product.stock);

    service.updateQuantity(0, 99);
    expect(service.items[0].quantity).toBe(product.stock);
  });

  it('removes items and clears the cart', () => {
    service.addItem(product, 2);
    service.removeItem(0);
    expect(service.items).toEqual([]);
    expect(service.count$.value).toBe(0);

    service.addItem(product, 1);
    service.clear();
    expect(service.items).toEqual([]);
    expect(localStorage.getItem('cart')).toBe('[]');
  });

  it('restores valid persisted owned-product cart data', () => {
    localStorage.setItem('cart', JSON.stringify([{ item: product, quantity: 3 }]));

    const restoredService = new CartsService(
      TestBed.inject((service as any).http?.constructor ?? Object) as never,
    );

    expect(restoredService.items).toEqual([{ item: product, quantity: 3 }]);
  });

  it('discards malformed persisted entries', () => {
    localStorage.setItem('cart', JSON.stringify([
      { item: product, quantity: 2 },
      { item: { id: 2 }, quantity: 1 },
      { item: product, quantity: 'bad' },
    ]));

    const fresh = TestBed.inject(CartsService);
    expect(fresh.items[0]?.item.id).toBe(product.id);
  });

  it('submits only product ids and quantities to the orders endpoint', () => {
    service.addItem(product, 2);
    service.createOrder().subscribe();

    const request = http.expectOne('https://fakestoreapi.com/orders');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      items: [{ productId: 'product-1', quantity: 2 }],
    });

    request.flush({
      id: 'order-1',
      orderNo: 'MKT-1',
      customerId: null,
      customer: null,
      status: 'PENDING',
      subtotal: 198,
      shipping: 0,
      tax: 0,
      total: 198,
      currency: 'USD',
      createdAt: '2026-09-27T00:00:00.000Z',
      updatedAt: '2026-09-27T00:00:00.000Z',
      items: [],
    });
  });
});
