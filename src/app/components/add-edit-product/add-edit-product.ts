import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Product, ProductSize, Brand, Image } from '../../interfaces/product';
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
  categories: string[] = [
    'Alimentos Secos',
    'Alimentos Húmedos',
    'Snacks',
    'Arena para Gatos',
    'Accesorios',
    'Productos Veterinarios'
  ];
  types: string[] = ['Alimentos', 'Snack', 'Arena', 'Juguete', 'Accesorio', 'Cuidado'];
  animalCategories: string[] = ['Gato', 'Perro', 'Hamster', 'Pájaro', 'Caballo', 'Vaca'];
  brands: Brand[] = [];
  loading: boolean = false;

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
      images: this.fb.array([]),
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
      this.operacion = 'Editar ';
      this.getProduct(this.id);
    }
  }

  get sizes(): FormArray {
    return this.form.get('sizes') as FormArray;
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  addSize(size?: ProductSize) {
    const sizeForm = this.fb.group({
      size: [size?.size || '', Validators.required],
      price: [size?.price || 0, [Validators.required, Validators.min(0)]],
      stock_quantity: [size?.stock_quantity || 0, [Validators.required, Validators.min(0)]],
      image_url: [size?.image_url || ''], // Mantenido por compatibilidad, opcional
    });
    this.sizes.push(sizeForm);
  }

  removeSize(index: number) {
    this.sizes.removeAt(index);
  }

  addImage(image?: Image) {
    const imageForm = this.fb.group({
      image_url: [image?.image_url || '', Validators.required],
    });
    this.images.push(imageForm);
  }

  removeImage(index: number) {
    this.images.removeAt(index);
  }

  getProduct(id: number) {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (data: Product) => {
        this.form.patchValue({
          title: data.title,
          description: data.description,
          category: this.categories.includes(data.category) ? data.category : '',
          type: this.types.includes(data.type) ? data.type : '',
          animal_category: this.animalCategories.includes(data.animal_category) ? data.animal_category : '',
          brand_id: data.brand_id,
        });
        this.sizes.clear();
        data.sizes?.forEach((size) => this.addSize(size));
        this.images.clear();
        data.images?.forEach((image) => this.addImage(image));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener el producto:', error);
        this.toastrService.error('Error al obtener el producto', 'Error');
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  addProduct() {
    if (this.form.invalid) {
      this.toastrService.error('Por favor, completa todos los campos requeridos', 'Error');
      return;
    }

    this.loading = true;
    const product: Product = {
      title: this.form.value.title,
      description: this.form.value.description,
      category: this.form.value.category,
      type: this.form.value.type,
      animal_category: this.form.value.animal_category,
      brand_id: this.form.value.brand_id,
      sizes: this.form.value.sizes,
      images: this.form.value.images.map((img: any) => ({ image_url: img.image_url })),
    };

    if (this.id !== 0) {
      product.id = this.id;
      this.productService.updateProduct(this.id, product).subscribe({
        next: () => {
          this.toastrService.success('Producto actualizado con éxito', 'Éxito');
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.toastrService.error('Error al actualizar el producto', 'Error');
          this.loading = false;
        },
      });
    } else {
      this.productService.saveProduct(product).subscribe({
        next: () => {
          this.toastrService.success('Producto guardado con éxito', 'Éxito');
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/']).then(() => {
              window.location.reload();
            });
          }, 100);
        },
        error: (error) => {
          this.toastrService.error('Error al guardar el producto', 'Error');
          this.loading = false;
        },
      });
    }
  }
}