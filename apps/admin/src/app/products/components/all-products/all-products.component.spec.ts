import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Product } from '../../models/product';
import { ProductsService } from '../../services/products.service';
import { AllProductsComponent } from './all-products.component';

describe('AllProductsComponent', () => {
  let component: AllProductsComponent;
  let service: jasmine.SpyObj<ProductsService>;

  const product: Product = {
    id: 'product-1',
    title: 'Camera',
    slug: 'camera',
    sku: 'CAM-001',
    stock: 5,
    price: 100,
    description: 'Test product',
    category: 'electronics',
    image: 'https://example.com/camera.jpg',
  };

  beforeEach(() => {
    service = jasmine.createSpyObj<ProductsService>('ProductsService', [
      'getAllProducts',
      'getAllCategories',
      'createProduct',
      'updateProduct',
      'deleteProduct',
    ]);

    service.getAllProducts.and.returnValue(of([product]));
    service.getAllCategories.and.returnValue(of(['electronics']));
    service.createProduct.and.returnValue(of({ ...product, id: 'product-2' }));
    service.updateProduct.and.returnValue(of(product));
    service.deleteProduct.and.returnValue(of({ ...product, status: 'ARCHIVED' }));

    component = new AllProductsComponent(service, new FormBuilder());
    component.ngOnInit();
  });

  it('loads products and categories', () => {
    expect(component.products).toEqual([product]);
    expect(component.categories).toEqual(['electronics']);
    expect(component.loading).toBeFalse();
  });

  it('switches into edit mode and submits an update', () => {
    component.beginUpdate(product);
    component.saveProduct();

    expect(component.editingProductId).toBeNull();
    expect(service.updateProduct).toHaveBeenCalledWith(
      'product-1',
      jasmine.objectContaining({
        title: 'Camera',
        slug: 'camera',
        sku: 'CAM-001',
        stock: 5,
        category: 'electronics',
      }),
    );
    expect(component.feedbackMessage).toContain('updated');
  });

  it('creates a product from a valid form', () => {
    component.beginCreate();
    component.form.setValue({
      title: 'Doorbell',
      slug: 'doorbell',
      sku: 'DOOR-001',
      price: 80,
      stock: 8,
      description: 'Smart doorbell',
      image: 'https://example.com/doorbell.jpg',
      category: 'electronics',
    });

    component.saveProduct();

    expect(service.createProduct).toHaveBeenCalledWith(
      jasmine.objectContaining({
        slug: 'doorbell',
        sku: 'DOOR-001',
        stock: 8,
      }),
    );
    expect(component.products[0].title).toBe('Camera');
    expect(component.feedbackMessage).toContain('created');
  });

  it('archives a removed product from the current view', () => {
    component.deleteProduct(product);

    expect(service.deleteProduct).toHaveBeenCalledWith('product-1');
    expect(component.products).toEqual([]);
    expect(component.feedbackMessage).toContain('archived');
  });

  it('surfaces catalog loading errors', () => {
    service.getAllProducts.and.returnValue(throwError(() => new Error('failed')));

    component.getProducts();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('could not be loaded');
  });
});
