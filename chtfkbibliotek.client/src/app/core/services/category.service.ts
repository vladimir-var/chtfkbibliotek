import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Subcategory } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = (environment as any).apiUrl;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/Category`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/Category/${id}`);
  }

  createCategory(category: { name: string }): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/Category`, category);
  }

  updateCategory(id: number, category: { name: string }): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/Category/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Category/${id}`);
  }

  getSubcategoriesByCategory(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/Subcategory/category/${categoryId}`);
  }

  createSubcategory(subcategory: { name: string; description?: string; categoryId: number }): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}/Subcategory`, subcategory);
  }

  updateSubcategory(id: number, subcategory: { name: string; description?: string }): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}/Subcategory/${id}`, subcategory);
  }

  deleteSubcategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Subcategory/${id}`);
  }
} 
