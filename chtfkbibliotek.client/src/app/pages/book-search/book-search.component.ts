import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { SidebarFilterComponent } from '../../shared/sidebar-filter/sidebar-filter.component';
import { BookFilters } from '../../core/services/book.service';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BookCardComponent, SidebarFilterComponent]
})
export class BookSearchComponent implements OnInit {
  books: Book[] = [];             // Список книг
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

    // Підписуємося на відфільтровані книги
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

    // Підписуємося на зміни пагінації
    this.bookService.pagination$.subscribe({
      next: (pagination) => {
        console.log('Получена пагинация:', pagination);
        this.totalItems = pagination.totalItems;
        this.totalPages = pagination.totalPages;
      },
      error: (error) => console.error('Ошибка при загрузке пагинации:', error)
    });

    
  }

  /**
   * Застосувати фільтри (єдиний момент, коли відбувається запит до сервера)
   * Цей метод тепер отримує актуальні фільтри через BookService.filters$
   */
  applyFilters(): void {
    this.isLoading = true;
    this.currentPage = 1; // Скидаємо на першу сторінку при новому пошуку

    // Отримуємо поточні фільтри з BookService, які SidebarFilterComponent оновлює
    const currentFilters = this.bookService.filtersSubject.getValue();

    let updatedFilters: BookFilters = {
      ...currentFilters,
      authorSearch: undefined,
      titleSearch: undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.searchTerm.trim() !== '') {
      if (this.searchTerm.toLowerCase().startsWith('автор:')) {
        updatedFilters.authorSearch = this.searchTerm.substring('автор:'.length).trim();
        updatedFilters.titleSearch = undefined;
      } else {
        updatedFilters.titleSearch = this.searchTerm.trim();
        updatedFilters.authorSearch = this.searchTerm.trim();
      }
    }

    this.bookService.updateFilters(updatedFilters);
  }

  /**
   * Скинути всі фільтри (жанри, роки, пошук)
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.isLoading = true;
    this.bookService.resetFilters(); // BookService.resetFilters() скидає всі фільтри, включаючи ті, що в SidebarFilterComponent
    this.books = []; // Очищаємо список книг при скиданні фільтрів
    this.isLoading = false;
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
   * Тепер перевіряємо через BookService.filters$ або через searchTerm
   */
  hasActiveFilters(): boolean {
    const currentFilters = this.bookService.filtersSubject.getValue();
    return (
      this.searchTerm.trim() !== '' ||
      currentFilters.categoryId !== null ||
      currentFilters.subcategoryId !== null
    );
  }

  /**
   * Змінити сторінку
   */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.isLoading = true;

    const currentFilters = this.bookService.filtersSubject.getValue();

    this.bookService.updateFilters({
      ...currentFilters,
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
