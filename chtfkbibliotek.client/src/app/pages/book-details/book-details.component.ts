import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BookDetailsComponent implements OnInit {
  book: Book | undefined;
  
  constructor(
    private route: ActivatedRoute,
    private bookService: BookService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const bookId = Number(params.get('id'));
      if (bookId) {
        this.loadBook(bookId);
      }
    });
  }
  
  private loadBook(id: number): void {
    this.bookService.getBookById(id).subscribe(book => {
      this.book = book;
    });
  }
}
