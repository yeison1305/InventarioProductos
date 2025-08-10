export interface Product {
  id?: number;
  title: string;
  description: string;
  category: string;
  type: string;
  animal_category: string;
  brand_id: number;
  created_at?: string;
  sizes?: ProductSize[];
  images?: Image[]; // Nuevo campo para imágenes
  brand?: Brand;
  rating?: Rating | null;
}

export interface ProductSize {
  size_id?: number;
  product_id?: number;
  size: string;
  price: number;
  stock_quantity: number;
  image_url?: string | null; // Mantenido por compatibilidad, pero ahora opcional
  catalog_product_id?: string | null;
  is_free?: boolean;
}

export interface Image {
  image_id?: number;
  image_url: string;
}

export interface Brand {
  id: number;
  name: string;
  image_url?: string | null;
}

export interface Rating {
  product_id: number;
  rating_rate: number;
  rating_count: number;
}

export interface ProductResponse {
  msg: string;
  data: Product[] | Product;
}