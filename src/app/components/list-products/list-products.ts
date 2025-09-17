import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product, ProductSize, Image } from '../../interfaces/product';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-products.html',
  styleUrls: ['./list-products.css'],
})
export class ListProducts implements OnInit {
  listProducts: Product[] = [];
  loading: boolean = false;
  selectAll: boolean = false;

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
        this.listProducts = data.map(p => ({ ...p, selected: false }));
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

  toggleSelectAll() {
    this.listProducts.forEach(p => (p.selected = this.selectAll));
  }

  checkIfAllSelected() {
    this.selectAll = this.listProducts.every(p => p.selected);
  }

  toggleActive(product: Product) {
    this._productService.updateProduct(product.id!, { is_active: product.is_active }).subscribe({
      next: () => {
        this.toastr.success(`Producto ${product.is_active ? 'activado' : 'desactivado'}`);
      },
      error: () => {
        this.toastr.error('Error al actualizar estado del producto');
        product.is_active = !product.is_active; // revertir cambio si falla
      }
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

  updatePrice(productId: number, size: string, newPrice: number, sizeIndex: number) {
    const product = this.listProducts.find(p => p.id === productId);
    if (!product) {
      this.toastr.error('Producto no encontrado', 'Error');
      return;
    }

    // Verificar si sizes está definido
    if (!product.sizes || product.sizes.length === 0) {
      this.toastr.error('El producto no tiene tallas definidas', 'Error');
      return;
    }

    // Crear una copia del array de tallas
    const updatedSizes = [...product.sizes];
    if (sizeIndex >= updatedSizes.length) {
      this.toastr.error('Índice de talla inválido', 'Error');
      return;
    }

    // Guardar el precio original para revertir en caso de error
    const originalPrice = updatedSizes[sizeIndex].price;
    updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], price: newPrice };

    // Enviar la actualización al servidor
    this._productService.updateProduct(productId, { sizes: updatedSizes }).subscribe({
      next: (updatedProduct) => {
        // Actualizar la lista localmente con la respuesta del servidor
        product.sizes = updatedProduct.sizes;
        this.toastr.success(`Precio de la talla ${size} actualizado a $${newPrice}`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar precio:', err);
        this.toastr.error('Error al actualizar el precio', 'Error');
        // Revertir el cambio local si falla
        updatedSizes[sizeIndex].price = originalPrice;
        product.sizes = updatedSizes;
        this.cdr.detectChanges();
      }
    });
  }

  getSizesText(sizes?: ProductSize[]): string {
    return sizes?.map((s) => `${s.size} ($${s.price}, Stock: ${s.stock_quantity})`).join(', ') || 'Sin tallas';
  }

  getFirstImageUrl(images?: Image[]): string | null {
    return images?.find(image => image.image_url)?.image_url || null;
  }
}