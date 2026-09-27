import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AdminOrder,
  OrderStatus,
  OrdersService,
} from '../../services/orders.service';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  readonly statuses: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  orders: AdminOrder[] = [];
  details?: AdminOrder;
  form!: FormGroup;
  loading = false;
  detailLoading = false;
  errorMessage = '';
  feedbackMessage = '';
  page = 1;
  limit = 25;
  total = 0;

  constructor(
    private service: OrdersService,
    private build: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.build.group({
      status: [''],
      from: [''],
      to: [''],
    });

    this.loadOrders();
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get canGoPrevious(): boolean {
    return this.page > 1;
  }

  get canGoNext(): boolean {
    return this.page < this.pageCount;
  }

  availableTransitions(status: OrderStatus): OrderStatus[] {
    return TRANSITIONS[status];
  }

  applyFilter(): void {
    this.page = 1;
    this.loadOrders();
  }

  clearFilter(): void {
    this.form.reset({
      status: '',
      from: '',
      to: '',
    });
    this.page = 1;
    this.loadOrders();
  }

  previousPage(): void {
    if (!this.canGoPrevious) return;
    this.page -= 1;
    this.loadOrders();
  }

  nextPage(): void {
    if (!this.canGoNext) return;
    this.page += 1;
    this.loadOrders();
  }

  view(order: AdminOrder): void {
    this.detailLoading = true;
    this.details = undefined;

    this.service.getOrder(order.id).subscribe({
      next: (details) => {
        this.details = details;
        this.detailLoading = false;
      },
      error: () => {
        this.detailLoading = false;
        this.feedbackMessage = 'Order details could not be loaded.';
      },
    });
  }

  updateStatus(order: AdminOrder, status: OrderStatus): void {
    this.feedbackMessage = '';

    this.service.updateStatus(order.id, status).subscribe({
      next: (updated) => {
        this.orders = this.orders.map((current) =>
          current.id === updated.id ? updated : current,
        );
        if (this.details?.id === updated.id) {
          this.details = updated;
        }
        this.feedbackMessage = `Order ${updated.orderNo} moved to ${updated.status}.`;
      },
      error: () => {
        this.feedbackMessage = 'Order status could not be updated.';
      },
    });
  }

  private loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    const raw = this.form.value as {
      status?: OrderStatus | '';
      from?: string;
      to?: string;
    };

    this.service.getOrders({
      status: raw.status || undefined,
      from: raw.from || undefined,
      to: raw.to || undefined,
      page: this.page,
      limit: this.limit,
    }).subscribe({
      next: (result) => {
        this.orders = result.items;
        this.total = result.total;
        this.page = result.page;
        this.limit = result.limit;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Orders could not be loaded. Please try again.';
      },
    });
  }
}
