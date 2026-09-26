import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Product } from '../../../products/models/product';
import { ProductsService } from '../../../products/services/products.service';
import { AdminCart, CartsService } from '../../services/carts.service';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  let component: CartComponent;
  let cartsService: jasmine.SpyObj<CartsService>;
  let productsService: jasmine.SpyObj<ProductsService>;

  const cart: AdminCart = {
    id: 1,
    userId: 3,
    date: '2026-09-01',
    products: [{ productId: 1, quantity: 2 }],
  };

  const product: Product = {
    id: 1,
    title: 'Camera',
    price: 100,
    description: 'Test product',
    category: 'electronics',
    image: 'camera.jpg',
  };

  beforeEach(() => {
    cartsService = jasmine.createSpyObj<CartsService>('CartsService', [
      'getAllCarts',
      'deleteCart',
    ]);
    productsService = jasmine.createSpyObj<ProductsService>('ProductsService', [
      'getProductById',
    ]);

    cartsService.getAllCarts.and.returnValue(of([cart]));
    cartsService.deleteCart.and.returnValue(of(cart));
    productsService.getProductById.and.returnValue(of(product));

    component = new CartComponent(cartsService, new FormBuilder(), productsService);
    component.ngOnInit();
  });

  it('loads carts on initialization', () => {
    expect(cartsService.getAllCarts).toHaveBeenCalled();
    expect(component.carts).toEqual([cart]);
  });

  it('applies date filters', () => {
    component.form.setValue({ start: '2026-09-01', end: '2026-09-30' });

    component.applyFilter();

    expect(cartsService.getAllCarts).toHaveBeenCalledWith({
      start: '2026-09-01',
      end: '2026-09-30',
    });
  });

  it('loads product details for a selected cart', () => {
    component.view(0);

    expect(productsService.getProductById).toHaveBeenCalledWith(1);
    expect(component.products).toEqual([{ item: product, quantity: 2 }]);
    expect(component.detailLoading).toBeFalse();
  });

  it('removes a deleted cart from the current view', () => {
    component.deleteCart(1);

    expect(cartsService.deleteCart).toHaveBeenCalledWith(1);
    expect(component.carts).toEqual([]);
    expect(component.feedbackMessage).toContain('deleted');
  });
});
