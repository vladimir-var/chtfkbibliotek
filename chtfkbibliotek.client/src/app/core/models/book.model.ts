import { Genre } from './genre.model';

export interface Book {
  id: number;
  title: string;
  author: string;
  genres: Genre[];
  yearPublished: number;
  publisher: string;
  pageCount: number;
  language: string;
  coverImage: string;
  description: string;
  content?: string; // Текст книги
}
