import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { Subject, of } from 'rxjs';
import { ProductDetailsComponent } from './product-details.component';
import { ProductsService } from '../../services/products.service';
import { CartsService } from '../../../carts/services/carts.service';
import { Product } from '../../models/product';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let productsService: jasmine.SpyObj<ProductsService>;
  let cartsService: jasmine.SpyObj<CartsService>;
  let paramMap$: Subject<ParamMap>;

  const productFor = (id: number): Product => ({
    id,
    title: `Product ${id}`,
    price: id * 10,
    category: 'test',
    description: 'Test description',
    image: 'product.jpg',
    rating: { rate: 4, count: 5 },
  });

  beforeEach(() => {
    paramMap$ = new Subject<ParamMap>();
    productsService = jasmine.createSpyObj<ProductsService>('ProductsService', ['getProductById']);
    cartsService = jasmine.createSpyObj<CartsService>('CartsService', ['addItem']);
    productsService.getProductById.and.callFake((id: number) => of(productFor(id)));

    const route = {
      paramMap: paramMap$.asObservable(),
    } as ActivatedRoute;

    component = new ProductDetailsComponent(route, productsService, cartsService);
    component.ngOnInit();
  });

  it('loads a product for the current route id', () => {
    paramMap$.next(convertToParamMap({ id: '1' }));

    expect(productsService.getProductById).toHaveBeenCalledWith(1);
    expect(component.data?.id).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('reloads when the route id changes', () => {
    paramMap$.next(convertToParamMap({ id: '1' }));
    paramMap$.next(convertToParamMap({ id: '2' }));

    expect(productsService.getProductById.calls.allArgs()).toEqual([[1], [2]]);
    expect(component.data?.id).toBe(2);
  });

  it('does not request an invalid product id', () => {
    paramMap$.next(convertToParamMap({ id: 'invalid' }));

    expect(productsService.getProductById).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('could not be loaded');
    expect(component.loading).toBeFalse();
  });
});
