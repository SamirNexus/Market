import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { Subject, of } from 'rxjs';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { ProductDetailsComponent } from './product-details.component';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let service: jasmine.SpyObj<ProductsService>;
  let params$: Subject<ParamMap>;

  const product: Product = {
    id: 1,
    title: 'Camera',
    price: 100,
    description: 'Test product',
    category: 'electronics',
    image: 'camera.jpg',
  };

  beforeEach(() => {
    params$ = new Subject<ParamMap>();
    service = jasmine.createSpyObj<ProductsService>('ProductsService', ['getProductById']);
    service.getProductById.and.callFake((id: number) => of({ ...product, id }));

    const route = { paramMap: params$.asObservable() } as ActivatedRoute;
    component = new ProductDetailsComponent(route, service);
    component.ngOnInit();
  });

  it('loads the product for the current route id', () => {
    params$.next(convertToParamMap({ id: '1' }));

    expect(service.getProductById).toHaveBeenCalledWith(1);
    expect(component.data?.id).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('reloads when the route id changes', () => {
    params$.next(convertToParamMap({ id: '1' }));
    params$.next(convertToParamMap({ id: '2' }));

    expect(service.getProductById.calls.allArgs()).toEqual([[1], [2]]);
    expect(component.data?.id).toBe(2);
  });

  it('rejects an invalid route id without an API request', () => {
    params$.next(convertToParamMap({ id: 'invalid' }));

    expect(service.getProductById).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Invalid');
  });
});
