import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, ProductResponse, Brand } from '../interfaces/product';
import { enviroments } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = enviroments.endpoint;
    this.myApiUrl = 'api/productos/';
  }

  getListProducts(): Observable<Product[]> {
    return this.http.get<ProductResponse>(`${this.myAppUrl}${this.myApiUrl}`).pipe(
      map((response) => (Array.isArray(response.data) ? response.data : [response.data]))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<ProductResponse>(`${this.myAppUrl}${this.myApiUrl}${id}`).pipe(
      map((response) => response.data as Product)
    );
  }

  saveProduct(product: Product): Observable<Product> {
    return this.http.post<ProductResponse>(`${this.myAppUrl}${this.myApiUrl}`, product).pipe(
      map((response) => response.data as Product)
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<ProductResponse>(`${this.myAppUrl}${this.myApiUrl}${id}`, product).pipe(
      map((response) => response.data as Product)
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.myAppUrl}api/brands`);
  }
}