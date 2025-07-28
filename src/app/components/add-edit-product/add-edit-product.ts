import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Product, ProductSize, Brand } from '../../interfaces/product';
import { ProductService } from '../../services/product';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-edit-product.html',
  styleUrls: ['./add-edit-product.css'],
})
export class AddEditProduct implements OnInit {
  form: FormGroup;
  id: number;
  operacion: string = 'Agregar ';
  categories: string[] = ['Pet Food', 'Accessories', 'Health'];
  types: string[] = ['Food', 'Toy', 'Medicine'];
  animalCategories: string[] = ['Cat', 'Dog', 'Other'];
  brands: Brand[] = [];
  loading: boolean = false; // Añadido estado de carga

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private toastrService: ToastrService,
    private aRouter: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      type: ['', Validators.required],
      animal_category: ['', Validators.required],
      brand_id: [null, Validators.required],
      sizes: this.fb.array([]),
    });
 
    this.id = Number(aRouter.snapshot.paramMap.get('id'));

  }

  ngOnInit() {
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      },
      error: (error) => {
        this.toastrService.error('Error al cargar marcas', 'Error');
      },
    });

    if (this.id !== 0) {
      this.operacion = 'Editar';
      this.getProduct(this.id);
    }
  }

  get sizes(): FormArray {
    return this.form.get('sizes') as FormArray;
  }

  addSize(size?: ProductSize) {
    const sizeForm = this.fb.group({
      size: [size?.size || '', Validators.required],
      price: [size?.price || 0, [Validators.required, Validators.min(0)]],
      stock_quantity: [size?.stock_quantity || 0, [Validators.required, Validators.min(0)]],
      image_url: [size?.image_url || ''],
    });
    this.sizes.push(sizeForm);
  }

  removeSize(index: number) {
    this.sizes.removeAt(index);
  }

  getProduct(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (data: Product) => {
        this.form.patchValue({
          title: data.title,
          description: data.description,
          category: data.category,
          type: data.type,
          animal_category: data.animal_category,
          brand_id: data.brand_id,
        });
        this.sizes.clear();
        data.sizes?.forEach((size) => this.addSize(size));
      },
      error: (error) => {
        console.error('Error al obtener el producto:', error);
        this.toastrService.error('Error al obtener el producto', 'Error');
      },
    });

  }

  goBack() {
    this.router.navigate(['/']);
  }

  addProduct() {
    this.loading = true; // Activar estado de carga
    const product: Product = {
      title: this.form.value.title,
      description: this.form.value.description,
      category: this.form.value.category,
      type: this.form.value.type,
      animal_category: this.form.value.animal_category,
      brand_id: this.form.value.brand_id,
      sizes: this.form.value.sizes,
    };

    if (this.id !== 0) {
      product.id = this.id;
      this.productService.updateProduct(this.id, product).subscribe({
        next: () => {
          this.toastrService.success('Producto actualizado con éxito', 'Éxito');
          this.loading = false; // Desactivar estado de carga
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.toastrService.error('Error al actualizar el producto', 'Error');
          this.loading = false; // Desactivar estado de carga en caso de error
        },
      });
    } else {
      this.productService.saveProduct(product).subscribe({
        next: () => {
          this.toastrService.success('Producto guardado con éxito', 'Éxito');
          this.loading = false; // Desactivar estado de carga
          // Forzar recarga de la lista
          setTimeout(() => {
            this.router.navigate(['/']).then(() => {
              window.location.reload(); // Recargar página para reflejar el nuevo producto
            });
          }, 100);
        },
        error: (error) => {
          this.toastrService.error('Error al guardar el producto', 'Error');
          this.loading = false; // Desactivar estado de carga en caso de error
        },
      });
    }
  }
}