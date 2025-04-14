import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';
import { DomSanitizer } from '@angular/platform-browser';

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
  pdfUrl: any;
  
  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private sanitizer: DomSanitizer
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
      next: (blob) => {
        try {
          if (!blob || blob.size === 0) {
            throw new Error('Файл порожній або не знайдено');
          }

          const url = window.URL.createObjectURL(blob);
          if (!url) {
            throw new Error('Не вдалося створити URL для PDF');
          }

          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.isLoading = false;
        } catch (error) {
          console.error('Помилка при обробці PDF:', error);
          this.error = 'Помилка при обробці PDF файлу.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Помилка при завантаженні PDF:', error);
        this.error = 'Не вдалося завантажити PDF файл.';
        this.isLoading = false;
      }
    });
  }
}
