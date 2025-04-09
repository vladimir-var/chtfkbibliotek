import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';
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
  
  // For notifications
  message: string = '';
  messageType: string = 'info';
  
  // New book form model
  newBook: Partial<Book> = {
    title: '',
    author: '',
    genres: [],
    yearPublished: new Date().getFullYear(),
    publisher: '',
    pageCount: 0,
    language: 'Українська',
    coverImage: '',
    description: '',
    content: ''
  };
  
  // Для завантаження тексту книги
  bookTextContent: string = '';
  selectedBookId: number | null = null;
  
  selectedGenres: number[] = [];
  
  // Поля для обробки файлу
  fileSelected: boolean = false;
  selectedFileName: string = '';
  fileContent: string = '';
  
  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadBooks();
    this.loadGenres();
  }
  
  loadBooks(): void {
    this.bookService.getAllBooks().subscribe(books => {
      this.books = books;
    });
  }
  
  loadGenres(): void {
    this.bookService.getAllGenres().subscribe(genres => {
      this.genres = genres;
    });
  }
  
  onSubmit(): void {
    this.addBook();
  }
  
  toggleGenre(genreId: number): void {
    const index = this.selectedGenres.indexOf(genreId);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genreId);
    }
  }
  
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
  
  addBook(): void {
    if (!this.validateBookForm()) {
      return;
    }
    
    // Map selected genre IDs to genre objects
    const bookGenres = this.genres.filter(genre => 
      this.selectedGenres.includes(genre.id)
    );
    
    // Додаємо текст книги з файлу, якщо він був обраний
    if (this.fileSelected && this.fileContent) {
      this.newBook.content = this.fileContent;
    }
    
    const bookToAdd: Omit<Book, 'id'> = {
      ...this.newBook as any,
      genres: bookGenres
    };
    
    this.bookService.addBook(bookToAdd);
    
    // Show success message
    let successMessage = 'Книгу успішно додано!';
    if (this.fileSelected) {
      successMessage += ' Текст книги також завантажений.';
    }
    this.message = successMessage;
    this.messageType = 'success';
    
    // Reset form
    this.resetBookForm();
    this.fileSelected = false;
    this.selectedFileName = '';
    this.fileContent = '';
    
    // Reload books
    this.loadBooks();
  }
  
  deleteBook(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цю книгу? Ця дія не може бути скасована.')) {
      this.bookService.deleteBook(id);
      this.loadBooks();
      this.message = 'Книгу видалено!';
      this.messageType = 'warning';
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  private validateBookForm(): boolean {
    if (!this.newBook.title || !this.newBook.author || !this.newBook.description || !this.newBook.coverImage) {
      this.message = 'Будь ласка, заповніть усі обов\'язкові поля.';
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
  
  private resetBookForm(): void {
    this.newBook = {
      title: '',
      author: '',
      genres: [],
      yearPublished: new Date().getFullYear(),
      publisher: '',
      pageCount: 0,
      language: 'Українська',
      coverImage: '',
      description: '',
      content: ''
    };
    this.selectedGenres = [];
  }
  
  // Метод для вибору книги для завантаження тексту
  selectBookForTextUpload(bookId: number): void {
    this.selectedBookId = bookId;
    this.bookTextContent = '';
    
    // Знаходимо книгу і, якщо в неї вже є текст, показуємо його
    this.bookService.getBookById(bookId).subscribe(book => {
      if (book && book.content) {
        this.bookTextContent = book.content;
      }
    });
  }
  
  // Метод для завантаження тексту книги
  uploadBookText(): void {
    if (!this.selectedBookId || !this.bookTextContent.trim()) {
      this.message = 'Будь ласка, виберіть книгу та введіть текст.';
      this.messageType = 'danger';
      return;
    }
    
    // Знаходимо індекс книги в масиві
    const bookIndex = this.books.findIndex(b => b.id === this.selectedBookId);
    if (bookIndex !== -1) {
      // Оновлюємо текст книги
      this.books[bookIndex].content = this.bookTextContent;
      
      // Показуємо повідомлення про успіх
      this.message = 'Текст книги успішно завантажено!';
      this.messageType = 'success';
      
      // Скидаємо вибір книги та текст
      this.selectedBookId = null;
      this.bookTextContent = '';
    }
  }
  
  // Метод для скасування завантаження тексту
  cancelTextUpload(): void {
    this.selectedBookId = null;
    this.bookTextContent = '';
  }
  // Метод для отримання назви вибраної книги
  getSelectedBookTitle(): string {
    const selectedBook = this.books.find(book => book.id === this.selectedBookId);
    return selectedBook ? selectedBook.title : '';
  }
  
  // Метод для отримання автора вибраної книги
  getSelectedBookAuthor(): string {
    const selectedBook = this.books.find(book => book.id === this.selectedBookId);
    return selectedBook ? selectedBook.author : '';
  }
  
  // Метод для обробки вибору файлу
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.fileSelected = true;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fileContent = e.target.result;
        this.newBook.content = this.fileContent; // Зберігаємо текст в об'єкт нової книги
      };
      reader.readAsText(file);
    } else {
      this.fileSelected = false;
      this.selectedFileName = '';
      this.fileContent = '';
    }
  }
}
