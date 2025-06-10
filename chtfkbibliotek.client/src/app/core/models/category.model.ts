export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Subcategory {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
} 