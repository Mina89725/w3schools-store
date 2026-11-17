import { Routes } from '@angular/router';
import { ProductList } from './products/product-list/product-list';
import { ShipperForm } from './shippers/shipper-form/shipper-form';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductList, title: 'Products' },
  { path: 'shippers/new', component: ShipperForm, title: 'New shipper' },
];
