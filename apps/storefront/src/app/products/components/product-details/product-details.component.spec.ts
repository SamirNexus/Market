import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { Subject, of } from 'rxjs';
import { CartsService } from '../../../carts/services/carts.service';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { ProductDetailsComponent } from './product-details.component';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let productsService: jasmine.SpyObj<ProductsService>;
  let cartsService: jasmine.SpyObj<CartsService>;
  let paramMap$: Subject<ParamMap>;

  const productFor = (id: string): Product => ({
    id,
    title: `Product ${id}`,
    slug: `product-${id}`,
    sku: 'TEST-001',
    stock: 5,
    status: 'ACTIVE',
    price: 10,
    category: 'test',
    description: 'Test description',
    image: 'product.jpg',
  });

  beforeEach(() => {
    paramMap$ = new Subject<ParamMap>();
    productsService = jasmine.createSpyObj<ProductsService>('ProductsService', ['getProductById']);
    cartsService = jasmine.createSpyObj<CartsService>('CartsService', ['addItem']);
    productsService.getProductById.and.callFake((id: string) => of(productFor(id)));

    const route = {
      paramMap: paramMap$.asObservable(),
    } as ActivatedRoute;

    component = new ProductDetailsComponent(route, productsService, cartsService);
    component.ngOnInit();
  });

  it('loads a product for the current route id', () => {
    paramMap$.next(convertToParamMap({ id: 'product-1' }));

    expect(productsService.getProductById).toHaveBeenCalledWith('product-1');
    expect(component.data?.id).toBe('product-1');
    expect(component.loading).toBeFalse();
  });

  it('reloads when the route id changes', () => {
    paramMap$.next(convertToParamMap({ id: 'product-1' }));
    paramMap$.next(convertToParamMap({ id: 'product-2' }));

    expect(productsService.getProductById.calls.allArgs()).toEqual([
      ['product-1'],
      ['product-2'],
    ]);
    expect(component.data?.id).toBe('product-2');
  });

  it('does not request a missing product id', () => {
    paramMap$.next(convertToParamMap({}));

    expect(productsService.getProductById).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('could not be loaded');
    expect(component.loading).toBeFalse();
  });
});
