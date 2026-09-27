import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  AdminOrder,
  OrdersService,
} from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let http: HttpTestingController;

  const order: AdminOrder = {
    id: 'order-1',
    orderNo: 'MKT-1',
    customerId: null,
    customer: null,
    status: 'PENDING',
    subtotal: 100,
    shipping: 0,
    tax: 0,
    total: 100,
    currency: 'USD',
    createdAt: '2026-09-27T00:00:00.000Z',
    updatedAt: '2026-09-27T00:00:00.000Z',
    items: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(OrdersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads a paginated filtered order list', () => {
    service.getOrders({
      status: 'PENDING',
      page: 2,
      limit: 25,
    }).subscribe();

    const request = http.expectOne(
      (candidate) => candidate.url === 'https://fakestoreapi.com/orders',
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('status')).toBe('PENDING');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('25');

    request.flush({
      items: [order],
      total: 26,
      page: 2,
      limit: 25,
    });
  });

  it('updates an order status through the controlled endpoint', () => {
    service.updateStatus(order.id, 'CONFIRMED').subscribe();

    const request = http.expectOne(
      'https://fakestoreapi.com/orders/order-1/status',
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'CONFIRMED' });
    request.flush({ ...order, status: 'CONFIRMED' });
  });
});
