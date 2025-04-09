import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Book } from '../../core/models/book.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BookCardComponent {
  @Input() book!: Book;
  @Input() compact: boolean = false;

  constructor(private router: Router) {}

  viewBookDetails(): void {
    this.router.navigate(['/book', this.book.id]);
  }
}
