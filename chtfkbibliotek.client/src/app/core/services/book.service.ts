import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Book, NewBook } from '../models/book.model';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export class BookServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type: 'NotFound' | 'ValidationError' | 'ServerError' = 'ServerError'
  ) {
    super(message);
    Object.setPrototypeOf(this, BookServiceError.prototype);
  }

  override get message(): string {
    return `BookServiceError: ${this.type} - ${super.message}`;
  }
}

export interface BookFilters {
  authorSearch?: string;
  titleSearch?: string;
  page: number;
  pageSize: number;
  categoryId: number | null;
  subcategoryId: number | null;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = environment.apiUrl;

  // Зроблено публічним для доступу з інших компонентів
  public filtersSubject = new BehaviorSubject<BookFilters>({
    authorSearch: '',
    titleSearch: '',
    page: 1,
    pageSize: 10,
    categoryId: null,
    subcategoryId: null
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
    formData.append('coverImage', book.coverImage || '');
    if (book.categoryId) formData.append('categoryId', book.categoryId.toString());
    if (book.subcategoryId) formData.append('subcategoryId', book.subcategoryId.toString());

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
    // Якщо підкатегорія не вибрана І немає активного пошуку за автором або назвою,
    // повертаємо порожній список книг.
    if (filters.subcategoryId === null && !filters.authorSearch && !filters.titleSearch) {
      this.paginationSubject.next({ totalItems: 0, totalPages: 0 }); // Оновлюємо пагінацію на 0
      return of([]); // Повертаємо Observable з порожнім масивом
    }

    let params = new HttpParams();

    if (filters.authorSearch) {
      params = params.set('authorSearch', filters.authorSearch);
    }
    if (filters.titleSearch) {
      params = params.set('titleSearch', filters.titleSearch);
    }
    if (filters.categoryId !== null) {
      params = params.set('categoryId', filters.categoryId.toString());
    }
    // subcategoryId є не-null завдяки перевірці вище
    if (filters.subcategoryId !== null) {
      params = params.set('subcategoryId', filters.subcategoryId.toString());
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
      authorSearch: '',
      titleSearch: '',
      page: 1,
      pageSize: 10,
      categoryId: null,
      subcategoryId: null
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

  // Завантажити вміст книги (текстовий файл) за її ID
  uploadBookContent(bookId: number, file: File): Observable<void> {
    const url = `${this.apiUrl}/books/${bookId}/content`;
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<void>(url, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => new BookServiceError('Книга не знайдена', 404, 'NotFound'));
        }
        if (error.status === 400) {
          return throwError(() => new BookServiceError(
            error.error || 'Помилка валідації вмісту книги',
            400,
            'ValidationError'
          ));
        }
        return throwError(() => new BookServiceError('Помилка при завантаженні вмісту книги', error.status));
      })
    );
  }
}
