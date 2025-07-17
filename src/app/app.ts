import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { ListProducts } from './components/list-products/list-products';
import { AddEditProduct } from './components/add-edit-product/add-edit-product';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, ListProducts, AddEditProduct, ReactiveFormsModule], // Elimina HttpClientModule
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class App {}