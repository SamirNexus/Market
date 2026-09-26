import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CartsService } from './carts.service';
import { Product } from '../../products/models/product';

describe('CartsService', () => {
  let service: CartsService;
  let http: HttpClient;

  const product: Product = {
    id: 1,
    title: 'Test product',
    price: 99,
    category: 'test',
    description: 'Test description',
    image: 'https://example.com/product.jpg',
    rating: { rate: 4.5, count: 10 },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    http = TestBed.inject(HttpClient);
    service = TestBed.inject(CartsService);
  });

  afterEach(() => {
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

  it('normalizes invalid quantities to at least one', () => {
    service.addItem(product, 0);
    expect(service.items[0].quantity).toBe(1);

    service.updateQuantity(0, -5);
    expect(service.items[0].quantity).toBe(1);
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

  it('restores valid persisted cart data', () => {
    localStorage.setItem('cart', JSON.stringify([{ item: product, quantity: 3 }]));

    const restoredService = new CartsService(http);

    expect(restoredService.items).toEqual([{ item: product, quantity: 3 }]);
    expect(restoredService.count$.value).toBe(3);
  });

  it('discards malformed persisted entries without breaking valid entries', () => {
    localStorage.setItem('cart', JSON.stringify([
      { item: product, quantity: 2 },
      { item: { id: 2 }, quantity: 1 },
      { item: product, quantity: 'bad' },
    ]));

    const restoredService = new CartsService(http);

    expect(restoredService.items).toEqual([{ item: product, quantity: 2 }]);
    expect(restoredService.count$.value).toBe(2);
  });

  it('falls back to an empty cart for invalid JSON', () => {
    localStorage.setItem('cart', '{not-json');

    const restoredService = new CartsService(http);

    expect(restoredService.items).toEqual([]);
    expect(restoredService.count$.value).toBe(0);
  });
});
