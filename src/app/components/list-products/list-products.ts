import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product, ProductSize, Image } from '../../interfaces/product'; // Ajusta la importación
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-products.html',
  styleUrls: ['./list-products.css'],
})
export class ListProducts implements OnInit {
  listProducts: Product[] = [];
  loading: boolean = false;

  constructor(
    private _productService: ProductService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getListProducts();
  }

  getListProducts() {
    this.loading = true;
    console.log('Iniciando carga de productos, loading:', this.loading);
    this._productService.getListProducts().subscribe({
      next: (data: Product[]) => {
        this.listProducts = [...data];
        console.log('Productos:', this.listProducts);
        console.log('listProducts después de asignar:', this.listProducts);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.toastr.error('Error al obtener productos', 'Error');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteProduct(id: number) {
    console.log('Producto a eliminar:', id);
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this._productService.deleteProduct(id).subscribe({
        next: () => {
          console.log('Producto eliminado');
          this.getListProducts();
          this.toastr.warning('Producto eliminado', 'El producto ha sido eliminado correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          this.toastr.error('Error al eliminar producto', 'Error');
        },
      });
    }
  }

  getSizesText(sizes?: ProductSize[]): string {
    return sizes?.map((s) => `${s.size} ($${s.price}, Stock: ${s.stock_quantity})`).join(', ') || 'Sin tallas';
  }

  getFirstImageUrl(images?: Image[]): string | null {
    return images?.find(image => image.image_url)?.image_url || null;
  }
}