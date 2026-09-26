import { BehaviorSubject, of, throwError } from 'rxjs';
import { CartComponent } from './cart.component';
import { CartsService } from '../../services/carts.service';
import { CartItem, Product } from '../../../products/models/product';

describe('CartComponent', () => {
  const product: Product = {
    id: 1,
    title: 'Test product',
    price: 25,
    category: 'test',
    description: 'Test description',
    image: 'product.jpg',
    rating: { rate: 4, count: 5 },
  };
  const cart: CartItem[] = [{ item: product, quantity: 2 }];

  let cartsService: jasmine.SpyObj<CartsService>;
  let cart$: BehaviorSubject<CartItem[]>;
  let component: CartComponent;

  beforeEach(() => {
    cart$ = new BehaviorSubject<CartItem[]>(cart);
    cartsService = jasmine.createSpyObj<CartsService>(
      'CartsService',
      ['updateQuantity', 'removeItem', 'clear', 'createOrder'],
      { cart$: cart$.asObservable() },
    );
    cartsService.createOrder.and.returnValue(of({}));

    component = new CartComponent(cartsService);
    component.ngOnInit();
  });

  it('calculates the cart total from price and quantity', () => {
    expect(component.totalPrice).toBe(50);
  });

  it('delegates cart mutations to the service', () => {
    component.changeQuantity(0, 3);
    component.removeProduct(0);
    component.clearCart();

    expect(cartsService.updateQuantity).toHaveBeenCalledWith(0, 3);
    expect(cartsService.removeItem).toHaveBeenCalledWith(0);
    expect(cartsService.clear).toHaveBeenCalled();
  });

  it('submits a demo order and clears the cart on success', () => {
    component.placeOrder();

    expect(cartsService.createOrder).toHaveBeenCalled();
    expect(cartsService.clear).toHaveBeenCalled();
    expect(component.success).toBeTrue();
    expect(component.submitting).toBeFalse();
  });

  it('surfaces order submission errors', () => {
    cartsService.createOrder.and.returnValue(
      throwError(() => new Error('order failure')),
    );

    component.placeOrder();

    expect(component.success).toBeFalse();
    expect(component.submitting).toBeFalse();
    expect(component.orderError).toContain('could not be placed');
  });
});
