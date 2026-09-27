import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { OrdersComponent } from './orders/components/orders/orders.component';
import { AllProductsComponent } from './products/components/all-products/all-products.component';
import { ProductDetailsComponent } from './products/components/product-details/product-details.component';
import { SettingsComponent } from './settings/components/settings/settings.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'products', component: AllProductsComponent, canActivate: [AuthGuard] },
  { path: 'details/:id', component: ProductDetailsComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'carts', redirectTo: 'orders', pathMatch: 'full' },
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: '**', redirectTo: 'products' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
