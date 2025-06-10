import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, Subcategory } from '../../core/models/category.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar-filter',
  templateUrl: './sidebar-filter.component.html',
  styleUrls: ['./sidebar-filter.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SidebarFilterComponent implements OnInit, OnDestroy {

  // Дані для фільтрації за категоріями/підкатегоріями
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  selectedCategoryId: number | null = null;
  selectedSubcategoryId: number | null = null;

  private destroy$ = new Subject<void>(); // For unsubscribing observables

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    // Підписуємося на зміни фільтрів з BookService, щоб синхронізувати стан UI
    this.bookService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        let shouldLoadSubcategories = false;
        // Оновлюємо локальний стан тільки якщо він відрізняється
        if (this.selectedCategoryId !== filters.categoryId) {
          this.selectedCategoryId = filters.categoryId;
          shouldLoadSubcategories = true;
        }
        if (this.selectedSubcategoryId !== filters.subcategoryId) {
          this.selectedSubcategoryId = filters.subcategoryId;
        }

        // Завантажуємо підкатегорії, якщо категорія змінилася і вибрана
        // або якщо категорія вже вибрана і ми просто ініціалізуємо компонент
        if (shouldLoadSubcategories && this.selectedCategoryId) {
          this.loadSubcategories(this.selectedCategoryId, filters.subcategoryId); // Pass subcategoryId to pre-select
        } else if (this.selectedCategoryId && this.subcategories.length === 0) {
          // Case where component initialized with existing category but subcategories not loaded yet
          this.loadSubcategories(this.selectedCategoryId, filters.subcategoryId);
        } else if (!this.selectedCategoryId) {
          // If category is null, clear subcategories
          this.subcategories = [];
        }
      });

    // Завантажуємо категорії
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Завантаження всіх категорій
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // The subscription to filters$ in ngOnInit should handle loading subcategories.
        // No need to explicitly load subcategories here unless this is the ONLY way categoryId gets set initially.
        // But since filters$ is a BehaviorSubject, it will immediately emit the current value.
        // So, the ngOnInit subscription will correctly handle initial loading.
      },
      error: (error) => {
        console.error('Помилка при завантаженні категорій:', error);
      }
    });
  }

  // Завантаження підкатегорій для вибраної категорії
  loadSubcategories(categoryId: number, preselectedSubcategoryId: number | null = null): void {
    this.categoryService.getSubcategoriesByCategory(categoryId).subscribe({
      next: (subcategories) => {
        this.subcategories = subcategories;
        // Скидаємо вибір підкатегорії, якщо вона не відповідає новим підкатегоріям
        // або якщо preselectedSubcategoryId є null (при зміні категорії, наприклад)
        if (preselectedSubcategoryId === null || !this.subcategories.some(sub => sub.id === preselectedSubcategoryId)) {
          this.selectedSubcategoryId = null;
        } else {
          this.selectedSubcategoryId = preselectedSubcategoryId;
        }
      },
      error: (error) => {
        console.error('Помилка при завантаженні підкатегорій:', error);
      }
    });
  }

  // Обробка зміни вибраної категорії
  onCategoryChange(): void {
    // Скидаємо підкатегорію при зміні категорії
    this.selectedSubcategoryId = null;

    if (this.selectedCategoryId) {
      this.loadSubcategories(this.selectedCategoryId);
    } else {
      this.subcategories = []; // Очищаємо підкатегорії, якщо категорія не вибрана
    }
    this.updateBookServiceFilters(); // Оновлюємо фільтри в BookService
  }

  // Обробка зміни вибраної підкатегорії
  onSubcategoryChange(): void {
    this.updateBookServiceFilters(); // Оновлюємо фільтри в BookService
  }

  /**
   * Оновлює фільтри в BookService на основі поточного стану SidebarFilterComponent
   */
  updateBookServiceFilters(): void {
    const currentFilters = this.bookService.filtersSubject.getValue(); // Отримуємо поточні фільтри
    const updatedFilters = {
      ...currentFilters, // Зберігаємо інші фільтри (наприклад, search term)
      categoryId: this.selectedCategoryId,
      subcategoryId: this.selectedSubcategoryId
    };
    this.bookService.updateFilters(updatedFilters); // Оновлюємо фільтри через BookService
  }

  /**
   * Викликається при натисканні на кнопку "Застосувати"
   * Наразі просто емітує подію, оскільки логіка фільтрації знаходиться у батьківському компоненті
   */
  applyFilters(): void {
    this.updateBookServiceFilters(); // Оновлюємо фільтри в BookService
  }

  /**
   * Викликається при натисканні на кнопку "Скинути"
   * Очищає локальні дані фільтрів та емітує подію
   */
  resetFilters(): void {
    this.selectedCategoryId = null; // Скидаємо вибрану категорію
    this.selectedSubcategoryId = null; // Скидаємо вибрану підкатегорію
    this.subcategories = []; // Очищаємо список підкатегорій
    this.bookService.resetFilters(); // BookService.resetFilters() скидає всі фільтри
    // The BookSearchComponent will react to bookService.resetFilters() via its filters$ subscription
  }

  /**
   * Перевіряє, чи є активні фільтри (використовується для відображення кнопки "Скинути")
   */
  hasActiveFilters(): boolean {
    const currentFilters = this.bookService.filtersSubject.getValue();
    return (
      currentFilters.categoryId !== null ||
      currentFilters.subcategoryId !== null
    );
  }
}
