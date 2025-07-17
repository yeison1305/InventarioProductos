import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-edit-product.html',
  styleUrls: ['./add-edit-product.css'],
})
export class AddEditProduct {
  form: FormGroup;
  id: number;
  operacion: string = 'Agregar ';

  constructor(private router: Router, private fb: FormBuilder, 
    private productService: ProductService,
    private toastrService: ToastrService,
    private aRouter: ActivatedRoute
    ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0, Validators.required],
      description: ['', Validators.required],
      stock: [0, Validators.required],
    });
 
    this.id = Number(aRouter.snapshot.paramMap.get('id'));

  }
  ngOnInit() {
    if(this.id !=0){
      this.operacion = 'Editar';
      this.getProduct(this.id); 
    }
  }
getProduct(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          name: data.name,
          description : data.description,
          price: data.price,
          stock: data.stock,
        });
      },
      error: (error) => {
        console.error('Error al obtener el producto:', error);
        this.toastrService.error('Error al obtener el producto', 'Error');
      }
    });

  }

  goBack() {
    this.router.navigate(['/']);
  }
  addproduct() {
    const product: Product = {
      name: this.form.value.name,
      description: this.form.value.description,
      price: this.form.value.price,
      stock: this.form.value.stock,
    };
    if (this.id !== 0) {
      this.id = this.id;
      this.productService.updateProduct(this.id, product).subscribe(() => {
      
        this.toastrService.success('Producto actualizado con exito', 'Éxitosamente');
        this.router.navigate(['/']);
        
      })
    } else {
      this.productService.saveProduct(product).subscribe(() => {
        console.log('Producto guardado exitosamente');
        this.router.navigate(['/']);
        this.toastrService.success('Producto guardado exitosamente', 'Éxito');
  
      })

    }
  


}
}