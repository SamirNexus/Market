import { ProductComponent } from './product.component';
import { Product } from '../../models/product';

describe('ProductComponent', () => {
  const product: Product = {
    id: 1,
    title: 'Test product',
    price: 99,
    category: 'test',
    description: 'Test description',
    image: 'product.jpg',
    rating: { rate: 4.5, count: 10 },
  };

  it('emits the selected product and a normalized quantity', () => {
    const component = new ProductComponent();
    component.data = product;
    component.amount = 0;

    const emitted: Array<{ item: Product; quantity: number }> = [];
    component.item.subscribe((value) => emitted.push(value));

    component.add();

    expect(emitted).toEqual([{ item: product, quantity: 1 }]);
    expect(component.amount).toBe(1);
    expect(component.selectingQuantity).toBeFalse();
  });
});
