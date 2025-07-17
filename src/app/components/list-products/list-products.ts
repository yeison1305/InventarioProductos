import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product, ProductResponse } from '../../interfaces/product';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, RouterModule,],
  templateUrl: './list-products.html',
  styleUrls: ['./list-products.css'],
})
export class ListProducts {
  listProducts: Product[] = [];
  loading: boolean = false;

  constructor(private _productService: ProductService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.getListProducts();
  }

  getListProducts() {
    this.loading = true; // Inicia el indicador de carga
    this._productService.getListProducts().subscribe({
      next: (data: ProductResponse) => {
        this.listProducts = data.data; // Asigna la propiedad 'data' que contiene el arreglo de productos
        console.log('Productos:', data);
        console.log('listProducts después de asignar:', this.listProducts);
        this.loading = false; // Detiene el indicador de carga
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
      },
    });
  }
  deleteProduct(id: number) {
    console.log('Producto a eliminar:', id);
    this._productService.deleteProduct(id).subscribe({
      next: (data) => {
        console.log('Producto eliminado:', data);
        this.getListProducts(); // Vuelve a cargar la lista de productos después de eliminar uno
        this.toastr.warning('Producto eliminado', 'El producto ha sido eliminado correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
      },
    });
  }
}