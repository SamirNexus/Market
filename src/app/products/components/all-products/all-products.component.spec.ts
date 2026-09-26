import { of, throwError } from 'rxjs';
import { AllProductsComponent } from './AllProductsComponent';
import { ProductsService } from '../../services/products.service';
import { CartsService } from '../../../carts/services/carts.service';
import { Product } from '../../models/product';

describe('AllProductsComponent', () => {
  let component: AllProductsComponent;
  let productsService: jasmine.SpyObj<ProductsService>;
  let cartsService: jasmine.SpyObj<CartsService>;

  const products: Product[] = [
    {
      id: 1,
      title: 'Alpha Phone',
      price: 200,
      category: 'electronics',
      description: 'Smart device',
      image: 'alpha.jpg',
      rating: { rate: 3.5, count: 10 },
    },
    {
      id: 2,
      title: 'Beta Shirt',
      price: 50,
      category: 'clothing',
      description: 'Cotton shirt',
      image: 'beta.jpg',
      rating: { rate: 4.8, count: 20 },
    },
  ];

  beforeEach(() => {
    productsService = jasmine.createSpyObj<ProductsService>('ProductsService', [
      'getAllProducts',
      'getAllCategories',
      'getProductsInCategory',
    ]);
    cartsService = jasmine.createSpyObj<CartsService>('CartsService', ['addItem']);

    productsService.getAllProducts.and.returnValue(of(products));
    productsService.getAllCategories.and.returnValue(of(['electronics', 'clothing']));
    productsService.getProductsInCategory.and.returnValue(of([products[0]]));

    component = new AllProductsComponent(productsService, cartsService);
  });

  it('filters products by search text', () => {
    component.products = products;
    component.searchTerm = 'cotton';

    expect(component.visibleProducts).toEqual([products[1]]);
  });

  it('sorts products by price and rating', () => {
    component.products = products;

    component.sortBy = 'price-low';
    expect(component.visibleProducts.map((product) => product.id)).toEqual([2, 1]);

    component.sortBy = 'rating';
    expect(component.visibleProducts.map((product) => product.id)).toEqual([2, 1]);
  });

  it('loads all products for the All category and API-filtered products otherwise', () => {
    component.filterCategory('All');
    expect(productsService.getAllProducts).toHaveBeenCalled();

    component.filterCategory('electronics');
    expect(productsService.getProductsInCategory).toHaveBeenCalledWith('electronics');
  });

  it('surfaces category loading failure without breaking the catalog', () => {
    productsService.getAllCategories.and.returnValue(
      throwError(() => new Error('category failure')),
    );

    component.getCategories();

    expect(component.categories).toEqual([]);
    expect(component.categoryError).toBe('Categories are temporarily unavailable.');
  });

  it('surfaces product loading failure and stops loading', () => {
    productsService.getAllProducts.and.returnValue(
      throwError(() => new Error('product failure')),
    );

    component.getProducts();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('could not load the catalog');
  });
});
