import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { Genre } from '../models/genre.model';
import { Injectable } from '@angular/core';

export interface BookFilters {
  genres: number[];
  yearFrom: number | null;
  yearTo: number | null;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = 'https://localhost:57078/api'; 

  
  private filtersSubject = new BehaviorSubject<BookFilters>({
    genres: [],
    yearFrom: null,
    yearTo: null,
    search: ''
  });


  filters$ = this.filtersSubject.asObservable();

  private filteredBooksSubject = new BehaviorSubject<Book[]>([]);
  filteredBooks$ = this.filteredBooksSubject.asObservable();

  constructor(private http: HttpClient) { }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/Books`);
  }


  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
  }


  getAllGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiUrl}/genre`);  // Путь с маленькой буквы
  }



  addBook(book: Omit<Book, 'id'>): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/books`, book);
  }


  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/books/${id}`);
  }


  getFilteredBooks(filters: BookFilters): Observable<Book[]> {
    const params: any = {};

    if (filters.genres?.length) params.genreId = filters.genres.join(',');
    if (filters.yearFrom) params.yearFrom = filters.yearFrom;
    if (filters.yearTo) params.yearTo = filters.yearTo;
    if (filters.search) params.search = filters.search;

    return this.http.get<Book[]>(`${this.apiUrl}/books/`, { params });
  }

  updateFilters(filters: BookFilters): void {
    this.filtersSubject.next(filters);


    this.getFilteredBooks(filters).subscribe(books => {
      this.filteredBooksSubject.next(books);
    });
  }


  resetFilters(): void {
    const defaultFilters: BookFilters = {
      genres: [],
      yearFrom: null,
      yearTo: null,
      search: ''
    };

    this.updateFilters(defaultFilters);
  }
}
