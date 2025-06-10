export interface Book {
  id: number;
  title: string;
  author: string;
  yearPublished: number;
  publisher: string;
  pageCount: number;
  language: string;
  coverImage: string;
  description: string;
  content?: string;
  categoryId: number;
  subcategoryId?: number;
}

export interface NewBook extends Omit<Book, 'id' | 'content'> {
  content?: File | null;
}

