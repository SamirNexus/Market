import { of } from 'rxjs';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('creates the authenticated admin navigation component', () => {
    const auth = {
      user$: of(null),
      logout: jasmine.createSpy('logout').and.returnValue(of(undefined)),
    };
    const router = {
      navigate: jasmine.createSpy('navigate'),
    };

    const component = new HeaderComponent(auth as never, router as never);

    expect(component).toBeTruthy();
  });
});
