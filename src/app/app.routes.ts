import { Routes } from '@angular/router';
import { ListProducts } from './components/list-products/list-products'; // Sin ".component"
import { AddEditProduct } from './components/add-edit-product/add-edit-product'; // Sin ".component"

export const routes: Routes = [
  { path: '', component: ListProducts },
  { path: 'add', component: AddEditProduct },
  {path: 'edit/:id', component: AddEditProduct },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];