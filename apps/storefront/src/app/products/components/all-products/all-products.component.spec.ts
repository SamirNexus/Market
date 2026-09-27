import { of, throwError } from 'rxjs';
import { CartsService } from '../../../carts/services/carts.service';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { AllProductsComponent } from './all-products.component';

describe('AllProductsComponent', () => {
  let component: AllProductsComponent;
  let productsService: jasmine.SpyObj<ProductsService>;
  let cartsService: jasmine.SpyObj<CartsService>;
  const settings = { currency$: of('EUR') };

  const products: Product[] = [
    {
      id: 'product-a',
      title: 'Alpha Phone',
      slug: 'alpha-phone',
      sku: 'ALPHA-001',
      stock: 4,
      status: 'ACTIVE',
      price: 200,
      category: 'electronics',
      description: 'Smart device',
      image: 'alpha.jpg',
    },
    {
      id: 'product-b',
      title: 'Beta Shirt',
      slug: 'beta-shirt',
      sku: 'BETA-001',
      stock: 12,
      status: 'ACTIVE',
      price: 50,
      category: 'clothing',
      description: 'Cotton shirt',
      image: 'beta.jpg',
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
    cartsService.addItem.and.returnValue('added');

    component = new AllProductsComponent(
      productsService,
      cartsService,
      settings as never,
    );
  });

  it('filters products by search text', () => {
    component.products = products;
    component.searchTerm = 'cotton';

    expect(component.visibleProducts).toEqual([products[1]]);
  });

  it('sorts products by price and stock', () => {
    component.products = products;

    component.sortBy = 'price-low';
    expect(component.visibleProducts.map((product) => product.id)).toEqual([
      'product-b',
      'product-a',
    ]);

    component.sortBy = 'stock';
    expect(component.visibleProducts.map((product) => product.id)).toEqual([
      'product-b',
      'product-a',
    ]);
  });

  it('loads all products for the All category and API-filtered products otherwise', () => {
    component.filterCategory('All');
    expect(productsService.getAllProducts).toHaveBeenCalled();

    component.filterCategory('electronics');
    expect(productsService.getProductsInCategory).toHaveBeenCalledWith('electronics');
  });

  it('does not add an out-of-stock product', () => {
    component.addToCart({
      item: { ...products[0], stock: 0 },
      quantity: 1,
    });

    expect(cartsService.addItem).not.toHaveBeenCalled();
    expect(component.cartMessage).toContain('out of stock');
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
