import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  genres: Genre[] = [];
  years: number[] = [];
  selectedGenres: number[] = [];
  filterForm: FormGroup;
  
  private currentFilters: {
    genres: number[],
    yearFrom: number | null,
    yearTo: number | null,
  } = {
    genres: [],
    yearFrom: null,
    yearTo: null
  };

  constructor(
    private bookService: BookService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      yearFrom: [null],
      yearTo: [null]
    });

    // Generate years for dropdown (1900 to current year)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    // Load genres for filter
    this.bookService.getAllGenres().subscribe(genres => {
      this.genres = genres;
    });

    // Subscribe to current filters
    this.bookService.filters$.subscribe((filters: {
      genres: number[],
      yearFrom: number | null,
      yearTo: number | null,
      search?: string
    }) => {
      this.currentFilters = filters;
      this.selectedGenres = [...filters.genres];
      
      // Update form controls without triggering events
      this.filterForm.patchValue({
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo
      }, { emitEvent: false });
    });
  }

  onGenreChange(genreId: number): void {
    const index = this.selectedGenres.indexOf(genreId);
    if (index === -1) {
      this.selectedGenres.push(genreId);
    } else {
      this.selectedGenres.splice(index, 1);
    }
    this.applyFilters();
  }

  isGenreSelected(genreId: number): boolean {
    return this.selectedGenres.includes(genreId);
  }

  applyFilters(): void {
    const yearFrom = this.filterForm.get('yearFrom')?.value;
    const yearTo = this.filterForm.get('yearTo')?.value;

    this.bookService.updateFilters({
      genres: this.selectedGenres,
      yearFrom: yearFrom,
      yearTo: yearTo
    });
  }

  resetFilters(): void {
    this.selectedGenres = [];
    this.filterForm.patchValue({
      yearFrom: null,
      yearTo: null
    });
    this.bookService.resetFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.currentFilters.genres.length > 0 ||
      this.currentFilters.yearFrom !== null ||
      this.currentFilters.yearTo !== null
    );
  }
}
