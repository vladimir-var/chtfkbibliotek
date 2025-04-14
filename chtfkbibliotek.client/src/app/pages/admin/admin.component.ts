import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { Book, NewBook } from '../../core/models/book.model';
import { Genre } from '../../core/models/genre.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class AdminComponent implements OnInit {
  books: Book[] = [];
  genres: Genre[] = [];

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
    content: null
  };

  // Для завантаження тексту книги
  bookTextContent: string = '';
  selectedBookId: number | null = null;

  selectedGenres: number[] = [];

  // Поля для обробки файлу
  fileSelected: boolean = false;
  selectedFileName: string = '';
  fileContent: string = '';
  fileError: string = '';

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Перевіряємо, чи є користувач адміністратором, якщо ні, перенаправляємо на сторінку входу
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    // Завантажуємо список книг і жанрів
    this.loadBooks();
    this.loadGenres();
  }

  // Завантаження всіх книг з сервісу
  loadBooks(): void {
    this.bookService.getAllBooks().subscribe(books => {
      this.books = books;
    });
  }

  // Завантаження всіх жанрів з сервісу
  loadGenres(): void {
    this.bookService.getAllGenres().subscribe(genres => {
      this.genres = genres;
    });
  }

  // Обробка події надсилання форми
  onSubmit(): void {
    console.log('Нова книга:', this.newBook);
    this.addBook();
  }

  // Перемикання вибору жанру для книги
  toggleGenre(genreId: number): void {
    const index = this.selectedGenres.indexOf(genreId);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genreId);
    }
  }

  // Обробка зміни стану чекбоксу для жанрів
  onGenreChange(genreId: number, event: any): void {
    if (event.target.checked) {
      this.selectedGenres.push(genreId);
    } else {
      const index = this.selectedGenres.indexOf(genreId);
      if (index > -1) {
        this.selectedGenres.splice(index, 1);
      }
    }
  }

  // Додавання нової книги
  addBook(): void {
    if (!this.validateBookForm()) {
      return;
    }

    // Формуємо список жанрів для нової книги
    const bookGenres = this.genres.filter(genre =>
      this.selectedGenres.includes(genre.id)
    );

    // Создаем объект для добавления книги
    const bookToAdd: NewBook = {
      ...this.newBook,
      genres: bookGenres
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
      this.message = 'Будь ласка, заповніть усі обов\'язкові поля.';
      this.messageType = 'danger';
      return false;
    }

    if (!this.fileSelected) {
      this.message = 'Будь ласка, виберіть PDF файл книги.';
      this.messageType = 'danger';
      return false;
    }

    if (this.selectedGenres.length === 0) {
      this.message = 'Будь ласка, виберіть хоча б один жанр для книги.';
      this.messageType = 'danger';
      return false;
    }

    return true;
  }

  // Скидання форми після додавання книги
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
      content: null
    };
    this.selectedGenres = [];
  }

  // Вибір книги для завантаження її тексту
  selectBookForTextUpload(bookId: number): void {
    this.selectedBookId = bookId;
    this.bookTextContent = '';

    // Завантаження поточного тексту книги
    this.bookService.getBookById(bookId).subscribe(book => {
      if (book && book.content) {
        this.bookTextContent = book.content;
      }
    });
  }

  // Завантаження тексту для вибраної книги
  uploadBookText(): void {
    if (!this.selectedBookId || !this.bookTextContent.trim()) {
      this.message = 'Будь ласка, виберіть книгу та введіть текст.';
      this.messageType = 'danger';
      return;
    }

    // Знаходимо книгу по ID і оновлюємо її текст
    const bookIndex = this.books.findIndex(b => b.id === this.selectedBookId);
    if (bookIndex !== -1) {
      this.books[bookIndex].content = this.bookTextContent;
      this.message = 'Текст книги успішно завантажено!';
      this.messageType = 'success';

      // Скидаємо вибір книги та текст
      this.selectedBookId = null;
      this.bookTextContent = '';
    }
  }

  // Скасування завантаження тексту
  cancelTextUpload(): void {
    this.selectedBookId = null;
    this.bookTextContent = '';
  }

  // Повернення назви вибраної книги
  getSelectedBookTitle(): string {
    const selectedBook = this.books.find(book => book.id === this.selectedBookId);
    return selectedBook ? selectedBook.title : '';
  }

  // Повернення автора вибраної книги
  getSelectedBookAuthor(): string {
    const selectedBook = this.books.find(book => book.id === this.selectedBookId);
    return selectedBook ? selectedBook.author : '';
  }

  // Обробка вибору файлу
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.fileError = '';
    
    if (file) {
      // Проверка расширения
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        this.fileError = 'Будь ласка, виберіть файл у форматі PDF';
        this.fileSelected = false;
        this.selectedFileName = '';
        return;
      }

      // Проверка размера (максимум 50MB)
      if (file.size > 50 * 1024 * 1024) {
        this.fileError = 'Розмір файлу не повинен перевищувати 50MB';
        this.fileSelected = false;
        this.selectedFileName = '';
        return;
      }

      this.selectedFileName = file.name;
      this.fileSelected = true;

      // Сохраняем сам файл для отправки
      this.newBook.content = file;
    } else {
      this.fileSelected = false;
      this.selectedFileName = '';
      this.newBook.content = null;
    }
  }
}
