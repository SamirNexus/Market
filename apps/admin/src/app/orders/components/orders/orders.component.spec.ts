import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { AdminOrder, OrdersService } from '../../services/orders.service';
import { OrdersComponent } from './orders.component';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let service: jasmine.SpyObj<OrdersService>;

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
    service = jasmine.createSpyObj<OrdersService>('OrdersService', [
      'getOrders',
      'getOrder',
      'updateStatus',
    ]);

    service.getOrders.and.returnValue(of({
      items: [order],
      total: 1,
      page: 1,
      limit: 25,
    }));
    service.getOrder.and.returnValue(of(order));
    service.updateStatus.and.returnValue(of({
      ...order,
      status: 'CONFIRMED',
    }));

    component = new OrdersComponent(service, new FormBuilder());
    component.ngOnInit();
  });

  it('loads the first page of orders', () => {
    expect(component.orders).toEqual([order]);
    expect(component.total).toBe(1);
  });

  it('defines only valid status transitions', () => {
    expect(component.availableTransitions('PENDING')).toEqual([
      'CONFIRMED',
      'CANCELLED',
    ]);
    expect(component.availableTransitions('CANCELLED')).toEqual([]);
  });

  it('updates an order status in the current page', () => {
    component.updateStatus(order, 'CONFIRMED');

    expect(service.updateStatus).toHaveBeenCalledWith(
      order.id,
      'CONFIRMED',
    );
    expect(component.orders[0].status).toBe('CONFIRMED');
  });
});
