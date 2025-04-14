import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { Genre } from '../models/genre.model';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';


export interface BookFilters {
  genres: number[];
  yearFrom: number | null;
  yearTo: number | null;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = 'https://localhost:57078/api';

  // Стан фільтрів з можливістю підписки
  private filtersSubject = new BehaviorSubject<BookFilters>({
    genres: [],
    yearFrom: null,
    yearTo: null,
    search: ''
  });
  filters$ = this.filtersSubject.asObservable();

  // Стан відфільтрованих книг з можливістю підписки
  private filteredBooksSubject = new BehaviorSubject<Book[]>([]);
  filteredBooks$ = this.filteredBooksSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Отримати всі книги (без фільтрації)
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/Books`);
  }

  // Отримати книгу за її ID
  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
  }

  // Отримати всі жанри
  getAllGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiUrl}/genre`);
  }

  // Додати нову книгу (без поля id)
  addBook(book: Omit<Book, 'id'> & { genres?: Genre[] }): Observable<Book> {
    const url = `${this.apiUrl}/books`;
    const formData = new FormData();

    // Добавляем все поля книги в FormData
    formData.append('title', book.title);
    formData.append('author', book.author);
    formData.append('description', book.description);
    formData.append('language', book.language);
    if (book.yearPublished) formData.append('yearPublished', book.yearPublished.toString());
    if (book.publisher) formData.append('publisher', book.publisher);
    if (book.pageCount) formData.append('pageCount', book.pageCount.toString());
    if (book.coverImage) formData.append('coverImage', book.coverImage);

    // Добавляем жанры как отдельные поля
    if (book.genres && book.genres.length > 0) {
      book.genres.forEach((genre: Genre) => {
        formData.append('genreIds', genre.id.toString());
      });
    }

    // Добавляем файл, если он есть
    if (book.content) {
      const blob = new Blob([book.content], { type: 'text/plain' });
      formData.append('file', blob, 'book.txt');
    }

    return this.http.post<Book>(url, formData).pipe(
      catchError(error => {
        console.error('Помилка при додаванні книги:', error);
        return throwError(() => new Error('Не вдалося додати книгу.'));
      })
    );
  }
  // Видалити книгу за її ID
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/books/${id}`);
  }

  /**
   * Отримати книги з фільтрацією за жанрами, роками та пошуковим запитом.
   * Цей метод використовується як для пошуку, так і для фільтрації.
   */
  getFilteredBooks(filters: BookFilters): Observable<Book[]> {
    let params = new HttpParams();

    if (filters.genres?.length) {
      filters.genres.forEach(genreId => {
        params = params.append('genreId', genreId.toString());
      });
    }
    if (filters.yearFrom !== null) {
      params = params.set('yearFrom', filters.yearFrom.toString());
    }
    if (filters.yearTo !== null) {
      params = params.set('yearTo', filters.yearTo.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<Book[]>(`${this.apiUrl}/books`, { params }).pipe(
      catchError(error => {
        console.error('Помилка запиту до API:', error); // Вивести помилку у консоль
        return throwError(() => new Error('Сталася помилка при отриманні книг')); // Повернути Observable з помилкою
      })
    );
  }


  /**
   * Оновлює фільтри та автоматично отримує новий список книг за цими фільтрами.
   * Використовується в sidebar-фільтрах.
   */
  updateFilters(filters: BookFilters): void {
    this.filtersSubject.next(filters);

    this.getFilteredBooks(filters).subscribe((books) => {
      this.filteredBooksSubject.next(books);
    });
  }

  /**
   * Скидає фільтри до дефолтного стану та оновлює список книг.
   * Використовується кнопкою "Скинути фільтри".
   */
  resetFilters(): void {
    const defaultFilters: BookFilters = {
      genres: [],
      yearFrom: null,
      yearTo: null,
      search: ''
    };

    this.updateFilters(defaultFilters);
  }

  // Отримати вміст книги за її ID
  getBookContent(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/books/${id}/content`, { responseType: 'arraybuffer' }).pipe(
      map(response => {
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(response);
      }),
      catchError(error => {
        console.error('Помилка при отриманні вмісту книги:', error);
        return throwError(() => new Error('Не вдалося отримати вміст книги.'));
      })
    );
  }
}
