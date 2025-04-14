import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';
import { Genre } from '../../core/models/genre.model';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { SidebarFilterComponent } from '../../shared/sidebar-filter/sidebar-filter.component';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BookCardComponent, SidebarFilterComponent]
})
export class BookSearchComponent implements OnInit {
  books: Book[] = [];             // Список книг
  genres: Genre[] = [];           // Список жанрів
  selectedGenres: number[] = [];  // Обрані жанри
  yearFrom: number | null = null; // Рік "від"
  yearTo: number | null = null;   // Рік "до"
  searchTerm = '';                // Пошуковий запит
  isLoading = false;              // Індикатор завантаження
  isMobileFiltersShown = true;    // Показ фільтрів на мобільному

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.isLoading = true;

    // Завантажити жанри
    this.bookService.getAllGenres().subscribe(genres => this.genres = genres);

    // Отримати книги (початкове завантаження)
    this.bookService.filteredBooks$.subscribe(books => {
      this.books = books;
      this.isLoading = false;
    });

    // Завантажити всі книги без фільтрів
    this.bookService.resetFilters();
  }

  /**
   * Перемкнути вибір жанру (не викликає фільтрацію автоматично)
   */
  toggleGenre(genreId: number): void {
    const index = this.selectedGenres.indexOf(genreId);
    if (index >= 0) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genreId);
    }
    // applyFilters() не викликається тут
  }

  /**
   * Видалити жанр з вибраних (не застосовує фільтри автоматично)
   */
  removeGenreFilter(name: string): void {
    const genre = this.genres.find(g => g.name === name);
    if (!genre) return;
    this.selectedGenres = this.selectedGenres.filter(id => id !== genre.id);
    // applyFilters() не викликається тут
  }

  /**
   * Отримати список назв обраних жанрів (для візуалізації)
   */
  getSelectedGenreNames(): string[] {
    return this.selectedGenres
      .map(id => this.genres.find(g => g.id === id)?.name || '')
      .filter(name => !!name);
  }

  /**
   * Застосувати фільтри (єдиний момент, коли відбувається запит до сервера)
   */
  applyFilters(): void {
    this.isLoading = true;
    this.bookService.updateFilters({
      genres: this.selectedGenres,
      yearFrom: this.yearFrom,
      yearTo: this.yearTo,
      search: this.searchTerm
    });
  }

  /**
   * Скинути всі фільтри (жанри, роки, пошук)
   */
  resetFilters(): void {
    this.selectedGenres = [];
    this.yearFrom = null;
    this.yearTo = null;
    this.searchTerm = '';
    this.isLoading = true;
    this.bookService.resetFilters();
  }

  /**
   * Обробити натискання кнопки пошуку
   */
  search(): void {
    this.applyFilters();
  }

  /**
   * Перемикання показу мобільних фільтрів
   */
  toggleMobileFilters(): void {
    this.isMobileFiltersShown = !this.isMobileFiltersShown;
  }

  /**
   * Перевірка: чи активні фільтри (для кнопки "Скинути")
   */
  hasActiveFilters(): boolean {
    return this.selectedGenres.length > 0
      || this.yearFrom !== null
      || this.yearTo !== null
      || this.searchTerm.trim() !== '';
  }
}
