import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book, NewBook } from '../models/book.model';
import { Genre } from '../models/genre.model';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

export class BookServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type: 'NotFound' | 'ValidationError' | 'ServerError' = 'ServerError'
  ) {
    super(message);
    this.name = 'BookServiceError';
  }

  override get message(): string {
    return super.message;
  }
}

export interface BookFilters {
  genres: number[];
  yearFrom: number | null;
  yearTo: number | null;
  search?: string;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = 'https://localhost:57078/api';

  // Стан фільтрів з можливістю підписки
  private filtersSubject = new BehaviorSubject<BookFilters>({
    genres: [],
    yearFrom: null,
    yearTo: null,
    search: '',
    page: 1,
    pageSize: 10
  });
  filters$ = this.filtersSubject.asObservable();

  // Стан відфільтрованих книг з можливістю підписки
  private filteredBooksSubject = new BehaviorSubject<Book[]>([]);
  filteredBooks$ = this.filteredBooksSubject.asObservable();

  // Стан пагінації
  private paginationSubject = new BehaviorSubject<{ totalItems: number, totalPages: number }>({ totalItems: 0, totalPages: 0 });
  pagination$ = this.paginationSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Отримати всі книги (без фільтрації)
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/Books`);
  }

  // Отримати книгу за її ID
  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => new BookServiceError('Книга не знайдена', 404, 'NotFound'));
        }
        return throwError(() => new BookServiceError('Помилка при отриманні книги', error.status));
      })
    );
  }

  // Отримати всі жанри
  getAllGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiUrl}/genre`);
  }

  // Додати нову книгу
  addBook(book: NewBook): Observable<Book> {
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
      formData.append('file', book.content);
    }

    return this.http.post<Book>(url, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          return throwError(() => new BookServiceError(
            error.error || 'Помилка валідації даних',
            400,
            'ValidationError'
          ));
        }
        return throwError(() => new BookServiceError('Помилка при додаванні книги', error.status));
      })
    );
  }

  // Видалити книгу за її ID
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/books/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => new BookServiceError('Книга не знайдена', 404, 'NotFound'));
        }
        return throwError(() => new BookServiceError('Помилка при видаленні книги', error.status));
      })
    );
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
    params = params.set('page', filters.page.toString());
    params = params.set('pageSize', filters.pageSize.toString());

    console.log('Отправка запроса с параметрами:', params.toString());

    return this.http.get<Book[]>(`${this.apiUrl}/books`, { params, observe: 'response' }).pipe(
      map(response => {
        const books = response.body || [];
        console.log('Получен ответ от сервера:', books);
        
        // Получаем заголовки пагинации
        const totalCount = parseInt(response.headers.get('X-Total-Count') || '0', 10);
        
        // Обновляем пагинацию
        this.paginationSubject.next({
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / filters.pageSize)
        });
        
        return books;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Ошибка при получении книг:', error);
        if (error.status === 400) {
          return throwError(() => new BookServiceError(
            'Помилка у параметрах фільтрації',
            400,
            'ValidationError'
          ));
        }
        return throwError(() => new BookServiceError('Помилка при отриманні книг', error.status));
      })
    );
  }

  /**
   * Оновлює фільтри та автоматично отримує новий список книг за цими фільтрами.
   * Використовується в sidebar-фільтрах.
   */
  updateFilters(filters: BookFilters): void {
    this.filtersSubject.next(filters);

    this.getFilteredBooks(filters).subscribe({
      next: (books) => {
        this.filteredBooksSubject.next(books);
      },
      error: (error) => {
        console.error('Ошибка при получении книг:', error);
        this.filteredBooksSubject.next([]); // В случае ошибки устанавливаем пустой массив
      }
    });
  }

  /**
   * Скидає фільтри до дефолтного стану та оновлює список книг.
   * Використовується кнопкою "Скинути фільтри".
   */
  resetFilters(): void {
    console.log('Сброс фильтров');
    const defaultFilters: BookFilters = {
      genres: [],
      yearFrom: null,
      yearTo: null,
      search: '',
      page: 1,
      pageSize: 10
    };

    console.log('Применение фильтров по умолчанию:', defaultFilters);
    this.updateFilters(defaultFilters);
  }

  // Отримати вміст книги за її ID
  getBookContent(bookId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/books/${bookId}/content`, { 
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => new BookServiceError('Книга не знайдена', 404, 'NotFound'));
        }
        if (error.status === 400) {
          return throwError(() => new BookServiceError(
            error.error || 'Помилка при отриманні вмісту книги',
            400,
            'ValidationError'
          ));
        }
        return throwError(() => new BookServiceError('Помилка при отриманні вмісту книги', error.status));
      })
    );
  }
}
