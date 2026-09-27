import { BehaviorSubject, of } from 'rxjs';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('creates storefront navigation with cart and store settings streams', () => {
    const carts = {
      count$: new BehaviorSubject(2),
    };
    const settings = {
      settings$: of({
        id: 'default',
        storeName: 'Market',
        supportEmail: null,
        currency: 'USD',
        locale: 'en-US',
        logoUrl: null,
        primaryColor: '#111827',
        createdAt: '',
        updatedAt: '',
      }),
    };

    const component = new HeaderComponent(
      carts as never,
      settings as never,
    );

    expect(component).toBeTruthy();
  });
});
