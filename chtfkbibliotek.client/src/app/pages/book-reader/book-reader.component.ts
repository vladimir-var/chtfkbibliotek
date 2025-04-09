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
    this.bookService.getBookById(this.bookId).subscribe(book => {
      this.book = book;
    });
  }
}
