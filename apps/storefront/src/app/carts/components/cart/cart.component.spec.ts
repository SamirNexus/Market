import { BehaviorSubject, of, throwError } from 'rxjs';
import { CartItem, Product } from '../../../products/models/product';
import { CartsService } from '../../services/carts.service';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
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
  const cart: CartItem[] = [{ item: product, quantity: 2 }];

  let cartsService: jasmine.SpyObj<CartsService>;
  let cart$: BehaviorSubject<CartItem[]>;
  let component: CartComponent;
  const settings = { currency$: of('EUR') };

  beforeEach(() => {
    cart$ = new BehaviorSubject<CartItem[]>(cart);
    cartsService = jasmine.createSpyObj<CartsService>(
      'CartsService',
      ['updateQuantity', 'removeItem', 'clear', 'createOrder'],
      { cart$: cart$.asObservable() },
    );
    cartsService.createOrder.and.returnValue(of({
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
    }));

    component = new CartComponent(cartsService, settings as never);
    component.ngOnInit();
  });

  it('calculates the cart total from price and quantity', () => {
    expect(component.totalPrice).toBe(198);
  });

  it('delegates cart mutations to the service', () => {
    component.changeQuantity(0, 3);
    component.removeProduct(0);
    component.clearCart();

    expect(cartsService.updateQuantity).toHaveBeenCalledWith(0, 3);
    expect(cartsService.removeItem).toHaveBeenCalledWith(0);
    expect(cartsService.clear).toHaveBeenCalled();
  });

  it('submits an owned order and stores the server confirmation', () => {
    component.placeOrder();

    expect(cartsService.createOrder).toHaveBeenCalledWith();
    expect(cartsService.clear).toHaveBeenCalled();
    expect(component.confirmedOrderNo).toBe('MKT-1');
    expect(component.confirmedTotal).toBe(198);
    expect(component.submitting).toBeFalse();
  });

  it('surfaces order submission errors', () => {
    cartsService.createOrder.and.returnValue(
      throwError(() => ({
        error: { message: 'Insufficient stock for Test product' },
      })),
    );

    component.placeOrder();

    expect(component.confirmedOrderNo).toBe('');
    expect(component.submitting).toBeFalse();
    expect(component.orderError).toContain('Insufficient stock');
  });
});
