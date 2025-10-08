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
  listProducts: (Product & { updating?: boolean })[] = [];
  loading: boolean = false;
  selectAll: boolean = false;
  categories: string[] = [
    'Alimentos Secos',
    'Alimentos Húmedos',
    'Snacks',
    'Arena para Gatos',
    'Accesorios',
    'Productos Veterinarios'
  ];
  types: string[] = ['Alimentos', 'Arena', 'Snack', 'Juguete', 'Accesorio', 'Cuidado'];
  animalCategories: string[] = ['Gato', 'Perro', 'Hamster', 'Pájaro', 'Caballo', 'Vaca'];

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
        this.listProducts = data.map(p => ({ ...p, selected: false, updating: false }));
        this.validateFields();
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

  validateFields() {
    this.listProducts.forEach(product => {
      if (!this.categories.includes(product.category)) {
        console.warn(`Categoría inválida para el producto ${product.id}: ${product.category}`);
        product.category = '';
      }
      if (!this.types.includes(product.type)) {
        console.warn(`Tipo inválido para el producto ${product.id}: ${product.type}`);
        product.type = '';
      }
      if (!this.animalCategories.includes(product.animal_category)) {
        console.warn(`Categoría de animal inválida para el producto ${product.id}: ${product.animal_category}`);
        product.animal_category = '';
      }
    });
  }

  toggleSelectAll() {
    this.listProducts.forEach(p => (p.selected = this.selectAll));
  }

  checkIfAllSelected() {
    this.selectAll = this.listProducts.every(p => p.selected);
  }

  toggleActive(product: Product & { updating?: boolean }) {
    product.updating = true;
    this.cdr.detectChanges();
    this._productService.updateProduct(product.id!, { is_active: product.is_active }).subscribe({
      next: () => {
        this.toastr.success(`Producto ${product.is_active ? 'activado' : 'desactivado'}`);
        product.updating = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Error al actualizar estado del producto');
        product.is_active = !product.is_active; // Revertir cambio si falla
        product.updating = false;
        this.cdr.detectChanges();
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

    if (!product.sizes || product.sizes.length === 0) {
      this.toastr.error('El producto no tiene tallas definidas', 'Error');
      return;
    }

    const updatedSizes = [...product.sizes];
    if (sizeIndex >= updatedSizes.length) {
      this.toastr.error('Índice de talla inválido', 'Error');
      return;
    }

    const originalPrice = updatedSizes[sizeIndex].price;
    updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], price: newPrice };
    product.updating = true;
    this.cdr.detectChanges();

    this._productService.updateProduct(productId, { sizes: updatedSizes }).subscribe({
      next: (updatedProduct) => {
        product.sizes = updatedProduct.sizes;
        this.toastr.success(`Precio de la talla ${size} actualizado a $${newPrice}`);
        product.updating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar precio:', err);
        this.toastr.error('Error al actualizar el precio', 'Error');
        updatedSizes[sizeIndex].price = originalPrice;
        product.sizes = updatedSizes;
        product.updating = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateField(productId: number, field: 'category' | 'type' | 'animal_category', value: string) {
    const product = this.listProducts.find(p => p.id === productId);
    if (!product) {
      this.toastr.error('Producto no encontrado', 'Error');
      return;
    }

    // Validar que el valor esté en la lista correspondiente
    const validLists: { [key: string]: string[] } = {
      category: this.categories,
      type: this.types,
      animal_category: this.animalCategories,
    };
    if (!validLists[field].includes(value) && value !== '') {
      this.toastr.error(`Valor inválido para ${field}`, 'Error');
      return;
    }

    // Guardar el valor original para revertir en caso de error
    const originalValue = product[field];
    product[field] = value;
    product.updating = true;
    this.cdr.detectChanges();

    // Crear el objeto de actualización solo con el campo modificado
    const updateData: Partial<Product> = { [field]: value };

    this._productService.updateProduct(productId, updateData).subscribe({
      next: (updatedProduct) => {
        product[field] = updatedProduct[field];
        this.toastr.success(`Campo ${field} actualizado correctamente`);
        product.updating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`Error al actualizar ${field}:`, err);
        this.toastr.error(`Error al actualizar el campo ${field}`, 'Error');
        product[field] = originalValue;
        product.updating = false;
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