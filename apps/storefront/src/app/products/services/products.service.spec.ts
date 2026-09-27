import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from '../models/product';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpController: HttpTestingController;

  const product: Product = {
    id: 'product-1',
    title: 'Test product',
    slug: 'test-product',
    sku: 'TEST-001',
    stock: 5,
    status: 'ACTIVE' as const,
    price: 99,
    category: 'electronics',
    description: 'Test description',
    image: 'https://example.com/product.jpg',
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

  it('requests all published products', () => {
    service.getAllProducts().subscribe((products) => {
      expect(products).toEqual([product]);
    });

    const request = httpController.expectOne('https://fakestoreapi.com/products');
    expect(request.request.method).toBe('GET');
    request.flush([product]);
  });

  it('requests published categories', () => {
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
      "https://fakestoreapi.com/products/category/men's%20clothing",
    );
    expect(request.request.method).toBe('GET');
    request.flush([product]);
  });

  it('requests a product by string id', () => {
    service.getProductById('product-1').subscribe((result) => {
      expect(result).toEqual(product);
    });

    const request = httpController.expectOne('https://fakestoreapi.com/products/product-1');
    expect(request.request.method).toBe('GET');
    request.flush(product);
  });
});
