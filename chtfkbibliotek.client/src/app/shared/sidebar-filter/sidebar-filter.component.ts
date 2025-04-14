import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Genre } from '../../core/models/genre.model';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-sidebar-filter',
  templateUrl: './sidebar-filter.component.html',
  styleUrls: ['./sidebar-filter.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SidebarFilterComponent implements OnInit {
  genres: Genre[] = []; // Список жанрів для чекбоксів
  years: number[] = []; // Список років для селектів
  selectedGenres: number[] = []; // Локально вибрані жанри
  filterForm: FormGroup; // Реактивна форма для років

  // Поточні фільтри з BookService
  private currentFilters: {
    genres: number[],
    yearFrom: number | null,
    yearTo: number | null,
    search?: string
  } = {
      genres: [],
      yearFrom: null,
      yearTo: null
    };

  constructor(
    private bookService: BookService,
    private fb: FormBuilder
  ) {
    // Ініціалізація форми
    this.filterForm = this.fb.group({
      yearFrom: [null],
      yearTo: [null]
    });

    // Створюємо список років від поточного до 1900
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    // Завантаження жанрів
    this.bookService.getAllGenres().subscribe(genres => {
      this.genres = genres;
    });

    // Підписка на глобальні фільтри (щоб оновити локальні дані у формі)
    this.bookService.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.selectedGenres = [...filters.genres];

      // Оновлюємо значення форми без запуску подій
      this.filterForm.patchValue({
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo
      }, { emitEvent: false });
    });
  }

  /**
   * Обробка кліку по чекбоксу жанру — додає або видаляє жанр з масиву selectedGenres
   * Ця функція не викликає фільтрацію одразу
   */
  onGenreChange(genreId: number): void {
    const index = this.selectedGenres.indexOf(genreId);
    if (index === -1) {
      this.selectedGenres.push(genreId);
    } else {
      this.selectedGenres.splice(index, 1);
    }
  }

  /**
   * Перевірка, чи жанр вибраний — для відображення стану чекбоксу
   */
  isGenreSelected(genreId: number): boolean {
    return this.selectedGenres.includes(genreId);
  }

  /**
   * Викликається при натисканні на кнопку "Застосувати"
   * Оновлює глобальні фільтри в BookService, які тригерять запит
   */
  applyFilters(): void {
    const yearFrom = this.filterForm.get('yearFrom')?.value ? Number(this.filterForm.get('yearFrom')?.value) : null;
    const yearTo = this.filterForm.get('yearTo')?.value ? Number(this.filterForm.get('yearTo')?.value) : null;

    this.bookService.updateFilters({
      genres: this.selectedGenres,
      yearFrom: yearFrom,
      yearTo: yearTo
    });
  }

  /**
   * Викликається при натисканні на кнопку "Скинути"
   * Очищає локальні дані та оновлює фільтри на дефолтні
   */
  resetFilters(): void {
    this.selectedGenres = [];
    this.filterForm.patchValue({
      yearFrom: null,
      yearTo: null
    });
    this.bookService.resetFilters();
  }

  /**
   * Перевіряє, чи є активні фільтри (використовується для відображення кнопки "Скинути")
   */
  hasActiveFilters(): boolean {
    return (
      this.currentFilters.genres.length > 0 ||
      this.currentFilters.yearFrom !== null ||
      this.currentFilters.yearTo !== null
    );
  }
}
