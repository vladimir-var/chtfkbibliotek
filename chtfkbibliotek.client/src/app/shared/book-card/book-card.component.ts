import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import type { Book } from '../../core/models/book.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class BookCardComponent {
  @Input() book!: Book;
  @Input() compact: boolean = false;

  constructor(private router: Router) {}

  navigateToBookDetails() {
    this.router.navigate(['/book', this.book.id]);
  }
}
