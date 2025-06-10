import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BookService, BookFilters } from '../../core/services/book.service';
import { Book, NewBook } from '../../core/models/book.model';
import { CategoryService } from '../../core/services/category.service';
import { Category, Subcategory } from '../../core/models/category.model';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class AdminComponent implements OnInit {
  books: Book[] = [];
  categories: Category[] = [];
  subcategories: Subcategory[] = [];

  // Для повідомлень (успіх, помилки тощо)
  message: string = '';
  messageType: string = 'info';

  // Модель форми для нової книги
  newBook: NewBook = {
    title: '',
    author: '',
    yearPublished: new Date().getFullYear(),
    publisher: '',
    pageCount: 0,
    language: 'Українська',
    coverImage: '',
    description: '',
    content: null,
    categoryId: 0,
    subcategoryId: undefined
  };

  // Додано для обробки категорій та підкатегорій
  selectedCategoryId: number | null = null;
  selectedSubcategoryId: number | null = null;
  newSubcategoryName: string = '';
  newSubcategoryDescription: string = '';

  // Додано для фільтрації
  selectedFilterCategoryId: number | null = null;
  selectedFilterSubcategoryId: number | null = null;
  filteredSubcategories: Subcategory[] = [];

  // Додано для пагінації
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Для завантаження тексту книги
  bookTextContent: string = '';
  selectedBookId: number | null = null;

  // Поля для обробки файлу
  fileSelected: boolean = false;
  selectedFileName: string = '';
  fileContent: string = '';
  fileError: string = '';

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private router: Router,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    // Завантажуємо список категорій
    this.loadCategories();

    // Ініціалізуємо фільтри у BookService
    this.bookService.filtersSubject.next({
      authorSearch: '',
      titleSearch: '',
      page: this.currentPage,
      pageSize: this.pageSize,
      categoryId: null,
      subcategoryId: null
    });

    // Підписуємося на відфільтровані книги
    this.bookService.filteredBooks$.subscribe({
      next: (books) => {
        this.books = books || [];
      },
      error: (error) => {
        console.error('Помилка при завантаженні книг:', error);
        this.message = 'Помилка при завантаженні списку книг. Будь ласка, спробуйте оновити сторінку.';
        this.messageType = 'danger';
      }
    });

    // Підписуємося на зміни пагінації
    this.bookService.pagination$.subscribe({
      next: (pagination) => {
        this.totalItems = pagination.totalItems;
        this.totalPages = pagination.totalPages;
      },
      error: (error) => console.error('Помилка при завантаженні пагінації:', error)
    });

    // Завантажуємо книги з початковими фільтрами
    this.applyFilters();
  }

  // Завантаження всіх книг з сервісу (тепер використовуємо applyFilters)
  loadBooks(): void {
    this.applyFilters();
  }

  // Додано: Завантаження всіх категорій
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
      this.categories = categories;
      if (this.categories.length > 0) {
          // Встановлюємо значення за замовчуванням для фільтрації
          this.selectedFilterCategoryId = null;
          this.selectedFilterSubcategoryId = null;
          this.newBook.categoryId = this.categories[0].id; // Для форми додавання книги
          this.loadSubcategories(this.categories[0].id); // Для форми додавання книги
        }
      },
      error: (error) => {
        console.error('Помилка при завантаженні категорій:', error);
        this.message = 'Помилка при завантаженні списку категорій. Будь ласка, спробуйте оновити сторінку.';
        this.messageType = 'danger';
      }
    });
  }

  // Додано: Завантаження підкатегорій для вибраної категорії
  loadSubcategories(categoryId: number): void {
    this.categoryService.getSubcategoriesByCategory(categoryId).subscribe(subcategories => {
      this.subcategories = subcategories; // Для форми додавання книги
      this.filteredSubcategories = subcategories; // Для фільтрації
      this.selectedSubcategoryId = null; // Скидаємо вибір підкатегорії для форми
      this.newBook.subcategoryId = undefined;
    });
  }

  // Додано: Обробка зміни вибраної категорії для нової книги
  onCategoryChange(): void {
    if (this.selectedCategoryId) {
      this.newBook.categoryId = this.selectedCategoryId;
      this.loadSubcategories(this.selectedCategoryId);
    } else {
      this.subcategories = [];
      this.newBook.categoryId = 0;
      this.newBook.subcategoryId = undefined;
    }
  }

  // Додано: Обробка зміни вибраної підкатегорії для нової книги
  onSubcategoryChange(): void {
    this.newBook.subcategoryId = this.selectedSubcategoryId !== null ? this.selectedSubcategoryId : undefined;
  }

  // Додано: Обробка зміни вибраної категорії для фільтрації
  onFilterCategoryChange(): void {
    this.selectedFilterSubcategoryId = null; // Скидаємо підкатегорію фільтра при зміні категорії
    if (this.selectedFilterCategoryId) {
      // Завантажуємо підкатегорії для фільтра
      this.categoryService.getSubcategoriesByCategory(this.selectedFilterCategoryId).subscribe(subcategories => {
        this.filteredSubcategories = subcategories;
        this.applyFilters();
      });
    } else {
      this.filteredSubcategories = [];
      this.applyFilters();
    }
  }

  // Додано: Обробка зміни вибраної підкатегорії для фільтрації
  onFilterSubcategoryChange(): void {
    this.applyFilters();
  }

  // Додано: Метод для застосування фільтрів до списку книг
  applyFilters(): void {
    const currentFilters = this.bookService.filtersSubject.getValue();

    const updatedFilters: BookFilters = {
      ...currentFilters,
      page: this.currentPage,
      pageSize: this.pageSize,
      categoryId: this.selectedFilterCategoryId,
      subcategoryId: this.selectedFilterSubcategoryId
    };
    
    this.bookService.updateFilters(updatedFilters);
  }

  // Додано: Створення нової підкатегорії
  createSubcategory(): void {
    if (!this.selectedCategoryId) {
      this.message = 'Будь ласка, спочатку виберіть категорію для нової підкатегорії.';
      this.messageType = 'danger';
      return;
    }
    if (!this.newSubcategoryName.trim()) {
      this.message = 'Будь ласка, введіть назву для нової підкатегорії.';
      this.messageType = 'danger';
      return;
    }

    const subcategoryData = {
      name: this.newSubcategoryName.trim(),
      description: this.newSubcategoryDescription.trim(),
      categoryId: this.selectedCategoryId
    };

    this.categoryService.createSubcategory(subcategoryData).subscribe({
      next: (response) => {
        this.message = 'Підкатегорію успішно додано!';
        this.messageType = 'success';
        this.newSubcategoryName = '';
        this.newSubcategoryDescription = '';
        this.loadSubcategories(this.selectedCategoryId!); // Перезавантажуємо підкатегорії
        this.selectedSubcategoryId = response.id; // Автоматично обираємо нову підкатегорію
        this.newBook.subcategoryId = response.id;
      },
      error: (error) => {
        console.error('Помилка при додаванні підкатегорії:', error);
        this.message = 'Помилка при додаванні підкатегорії. Будь ласка, спробуйте ще раз.';
        this.messageType = 'danger';
      }
    });
  }

  // Обробка події надсилання форми
  onSubmit(): void {
    console.log('Нова книга:', this.newBook);
    this.addBook();
  }

  // Додавання нової книги
  addBook(): void {
    if (!this.validateBookForm()) {
      return;
    }

    // Создаем объект для добавления книги
    const bookToAdd: NewBook = {
      ...this.newBook,
      categoryId: this.newBook.categoryId,
      subcategoryId: this.newBook.subcategoryId
    };

    // Викликаємо метод для додавання книги через сервіс
    this.bookService.addBook(bookToAdd).subscribe({
      next: (response) => {
        // Показуємо повідомлення про успіх
        let successMessage = 'Книгу успішно додано!';
        if (this.fileSelected) {
          successMessage += ' Текст книги також завантажений.';
        }
        this.message = successMessage;
        this.messageType = 'success';

        // Скидаємо форму та стани вибору файлу
        this.resetBookForm();
        this.fileSelected = false;
        this.selectedFileName = '';
        this.fileContent = '';

        // Перезавантажуємо список книг
        this.loadBooks();
      },
      error: (error) => {
        console.error('Помилка при додаванні книги:', error);
        this.message = 'Помилка при додаванні книги. Будь ласка, спробуйте ще раз.';
        this.messageType = 'danger';
      }
    });
  }

  // Видалення книги
  deleteBook(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цю книгу? Ця дія не може бути скасована.')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          // Перезавантажуємо список книг
          this.loadBooks();
          this.message = 'Книгу успішно видалено!';
          this.messageType = 'success';
        },
        error: (error) => {
          console.error('Помилка при видаленні книги:', error);
          this.message = 'Помилка при видаленні книги. Будь ласка, спробуйте ще раз.';
          this.messageType = 'danger';
        }
      });
    }
  }

  // Вихід з системи та перенаправлення на сторінку входу
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Перевірка форми на коректність заповнення обов'язкових полів
  private validateBookForm(): boolean {
    if (!this.newBook.title || !this.newBook.author || !this.newBook.description || !this.newBook.coverImage) {
      this.message = 'Будь ласка, заповніть усі обов`язкові поля.';
      this.messageType = 'danger';
      return false;
    }
    // Додано перевірку на categoryId
    if (!this.newBook.categoryId) {
      this.message = 'Будь ласка, виберіть категорію.';
      this.messageType = 'danger';
      return false;
    }
    return true;
  }

  // Скидає форму додавання книги
  private resetBookForm(): void {
    this.newBook = {
      title: '',
      author: '',
      yearPublished: new Date().getFullYear(),
      publisher: '',
      pageCount: 0,
      language: 'Українська',
      coverImage: '',
      description: '',
      content: null,
      categoryId: this.selectedCategoryId || 0,
      subcategoryId: undefined
    };
    // Після скидання форми, знову завантажуємо підкатегорії для поточної категорії
    if (this.selectedCategoryId) {
      this.loadSubcategories(this.selectedCategoryId);
    }
  }

  // Методи для завантаження та редагування тексту книги
  selectBookForTextUpload(bookId: number): void {
    this.selectedBookId = bookId;
    // Отримуємо існуючий текст книги (якщо він є)
    this.bookService.getBookContent(bookId).subscribe({
      next: (blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            this.bookTextContent = reader.result as string;
          };
          reader.readAsText(blob);
        } else {
          this.bookTextContent = '';
        }
      },
      error: (error) => {
        console.error('Помилка при отриманні тексту книги:', error);
        this.bookTextContent = 'Помилка при завантаженні тексту книги.';
      }
    });
  }

  uploadBookText(): void {
    if (!this.selectedBookId) {
      this.message = 'Будь ласка, виберіть книгу для завантаження тексту.';
      this.messageType = 'danger';
      return;
    }

    const bookFile = new File([this.bookTextContent], `book-${this.selectedBookId}-content.txt`, { type: 'text/plain' });

    this.bookService.uploadBookContent(this.selectedBookId, bookFile).subscribe({
      next: () => {
        this.message = 'Текст книги успішно завантажено!';
        this.messageType = 'success';
        this.cancelTextUpload(); // Очищаємо форму після завантаження
      },
      error: (error: HttpErrorResponse) => {
        console.error('Помилка при завантаженні тексту книги:', error);
        this.message = 'Помилка при завантаженні тексту книги. Будь ласка, спробуйте ще раз.';
        this.messageType = 'danger';
      }
    });
  }

  cancelTextUpload(): void {
    this.selectedBookId = null;
    this.bookTextContent = '';
  }

  getSelectedBookTitle(): string {
    const book = this.books.find(b => b.id === this.selectedBookId);
    return book ? book.title : '';
  }

  getSelectedBookAuthor(): string {
    const book = this.books.find(b => b.id === this.selectedBookId);
    return book ? book.author : '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.fileError = 'Будь ласка, оберіть файл формату PDF.';
        this.fileSelected = false;
        this.selectedFileName = '';
        this.newBook.content = null;
        return;
      }
      this.selectedFileName = file.name;
      this.fileSelected = true;
      this.newBook.content = file;
      this.fileError = '';
    } else {
      this.fileSelected = false;
      this.selectedFileName = '';
      this.newBook.content = null;
      this.fileError = '';
    }
  }
}
