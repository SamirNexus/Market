import { BehaviorSubject } from 'rxjs';
import { HeaderComponent } from './header.component';
import { CartsService } from '../../../carts/services/carts.service';

describe('HeaderComponent', () => {
  it('exposes the cart count stream from the cart service', () => {
    const cartsService = jasmine.createSpyObj<CartsService>(
      'CartsService',
      [],
      { count$: new BehaviorSubject<number>(3) },
    );

    const component = new HeaderComponent(cartsService);

    expect(component.cartCount$.value).toBe(3);
  });
});
