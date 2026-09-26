import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductsService } from './products.service';
import { Product } from '../models/product';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpController: HttpTestingController;

  const product: Product = {
    id: 1,
    title: 'Test product',
    price: 99,
    category: 'electronics',
    description: 'Test description',
    image: 'https://example.com/product.jpg',
    rating: { rate: 4.5, count: 10 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductsService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('requests all products', () => {
    service.getAllProducts().subscribe((products) => {
      expect(products).toEqual([product]);
    });

    const request = httpController.expectOne('https://fakestoreapi.com/products');
    expect(request.request.method).toBe('GET');
    request.flush([product]);
  });

  it('requests all categories', () => {
    service.getAllCategories().subscribe((categories) => {
      expect(categories).toEqual(['electronics']);
    });

    const request = httpController.expectOne('https://fakestoreapi.com/products/categories');
    expect(request.request.method).toBe('GET');
    request.flush(['electronics']);
  });

  it('requests products by encoded category', () => {
    service.getProductsInCategory("men's clothing").subscribe();

    const request = httpController.expectOne(
      'https://fakestoreapi.com/products/category/men%27s%20clothing',
    );
    expect(request.request.method).toBe('GET');
    request.flush([product]);
  });

  it('requests a product by id', () => {
    service.getProductById(1).subscribe((result) => {
      expect(result).toEqual(product);
    });

    const request = httpController.expectOne('https://fakestoreapi.com/products/1');
    expect(request.request.method).toBe('GET');
    request.flush(product);
  });
});
