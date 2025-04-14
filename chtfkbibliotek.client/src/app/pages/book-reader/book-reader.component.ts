import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';

@Component({
  selector: 'app-book-reader',
  templateUrl: './book-reader.component.html',
  styleUrls: ['./book-reader.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BookReaderComponent implements OnInit {
  book: Book | undefined;
  bookId: number = 0;
  bookContent: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bookId = +id;
        this.loadBook();
      }
    });
  }
  
  loadBook(): void {
    this.isLoading = true;
    this.error = null;

    // Загружаем информацию о книге
    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.book = book;
        // Загружаем содержимое книги
        this.loadBookContent();
      },
      error: (error) => {
        console.error('Помилка при завантаженні книги:', error);
        this.error = 'Не вдалося завантажити інформацію про книгу.';
        this.isLoading = false;
      }
    });
  }

  loadBookContent(): void {
    this.bookService.getBookContent(this.bookId).subscribe({
      next: (content) => {
        // Нормализуем текст и разбиваем на параграфы
        this.bookContent = content
          .replace(/\r\n/g, '\n')  // Заменяем Windows переносы на Unix
          .replace(/\r/g, '\n')    // Заменяем старые Mac переносы на Unix
          .split('\n')             // Разбиваем на строки
          .filter(line => line.trim()) // Удаляем пустые строки
          .join('\n\n');           // Соединяем с двойными переносами
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Помилка при завантаженні вмісту книги:', error);
        this.error = 'Не вдалося завантажити вміст книги.';
        this.isLoading = false;
      }
    });
  }
}
