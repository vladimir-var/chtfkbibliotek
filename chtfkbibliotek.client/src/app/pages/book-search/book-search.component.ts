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

  // Пагінація
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.isLoading = true;
    console.log('Инициализация BookSearchComponent');

    // Загружаем жанры
    this.bookService.getAllGenres().subscribe({
      next: (genres) => {
        console.log('Загружены жанры:', genres);
        this.genres = genres;
      },
      error: (error) => {
        console.error('Ошибка при загрузке жанров:', error);
        this.genres = [];
      }
    });

    // Подписываемся на отфильтрованные книги
    this.bookService.filteredBooks$.subscribe({
      next: (books) => {
        console.log('Получены книги:', books);
        this.books = books || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка при загрузке книг:', error);
        this.books = [];
        this.isLoading = false;
      }
    });

    // Подписываемся на изменения пагинации
    this.bookService.pagination$.subscribe({
      next: (pagination) => {
        console.log('Получена пагинация:', pagination);
        this.totalItems = pagination.totalItems;
        this.totalPages = pagination.totalPages;
      },
      error: (error) => console.error('Ошибка при загрузке пагинации:', error)
    });

    // Загружаем все книги без фильтров
    console.log('Вызов resetFilters');
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
    this.currentPage = 1; // Скидаємо на першу сторінку при новому пошуку
    this.bookService.updateFilters({
      genres: this.selectedGenres,
      yearFrom: this.yearFrom,
      yearTo: this.yearTo,
      search: this.searchTerm,
      page: this.currentPage,
      pageSize: this.pageSize
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
    this.currentPage = 1;
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

  /**
   * Змінити сторінку
   */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.isLoading = true;
    this.bookService.updateFilters({
      genres: this.selectedGenres,
      yearFrom: this.yearFrom,
      yearTo: this.yearTo,
      search: this.searchTerm,
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }

  /**
   * Отримати масив номерів сторінок для відображення
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
