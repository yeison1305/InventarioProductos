import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-add-edit-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-edit-product.html',
  styleUrls: ['./add-edit-product.css'],
})
export class AddEditProduct {
  form: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0, Validators.required],
      description: ['', Validators.required],
      stock: [0, Validators.required],
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
  addproduct() {
    const product: Product = {
      name: this.form.value.name,
      price: this.form.value.price,
      description: this.form.value.description,
      stock: this.form.value.stock,
    };
    console.log(product);
  }
}