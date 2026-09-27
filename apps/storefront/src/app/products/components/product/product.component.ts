import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  @Input() data!: Product;
  @Input() currency = 'USD';
  @Output() item = new EventEmitter<{ item: Product; quantity: number }>();

  selectingQuantity = false;
  amount = 1;

  add(): void {
    if (this.data.stock <= 0) return;

    const quantity = Math.min(
      Math.max(1, Math.floor(Number(this.amount) || 1)),
      this.data.stock,
    );

    this.item.emit({ item: this.data, quantity });
    this.amount = 1;
    this.selectingQuantity = false;
  }
}
