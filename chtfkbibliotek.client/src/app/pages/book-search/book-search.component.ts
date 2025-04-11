import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';
import { Genre } from '../../core/models/genre.model';
import { BookCardComponent } from '../../shared/book-card/book-card.component';
import { forkJoin } from 'rxjs'; // Для параллельных запросов

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BookCardComponent]
})
export class BookSearchComponent implements OnInit {
  books: Book[] = [];
  genres: Genre[] = [];
  selectedGenres: number[] = [];
  yearFrom: number | null = null;
  yearTo: number | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;
  isMobileFiltersShown: boolean = true;

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      genres: this.bookService.getAllGenres(),
      books: this.bookService.getAllBooks()
    }).subscribe(
      ({ genres, books }) => {
        console.log('Genres:', genres);  // Логируем жанры
        console.log('Books:', books);    // Логируем книги
        this.genres = genres;
        this.books = books;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
      }
    );

  }

  toggleGenre(genreId: number): void {
    const index = this.selectedGenres.indexOf(genreId);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genreId);
    }
    this.applyFilters();
  }

  getSelectedGenreNames(): string[] {
    return this.selectedGenres.map(id => {
      const genre = this.genres.find(g => g.id === id);
      return genre ? genre.name : '';
    }).filter(name => name !== '');
  }

  removeGenreFilter(genreName: string): void {
    const genre = this.genres.find(g => g.name === genreName);
    if (genre) {
      const index = this.selectedGenres.indexOf(genre.id);
      if (index > -1) {
        this.selectedGenres.splice(index, 1);
        this.applyFilters();
      }
    }
  }

  applyFilters(): void {
    this.isLoading = true;
    const filters = {
      genres: this.selectedGenres,
      yearFrom: this.yearFrom,
      yearTo: this.yearTo,
      search: this.searchTerm
    };

    this.bookService.getFilteredBooks(filters).subscribe(
      (books) => {
        this.books = books;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error applying filters:', error);
        this.isLoading = false;
      }
    );
  }

  resetFilters(): void {
    this.selectedGenres = [];
    this.yearFrom = null;
    this.yearTo = null;
    this.searchTerm = '';
    this.isLoading = true;

    this.bookService.getAllBooks().subscribe(
      (books) => {
        this.books = books;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error resetting filters:', error);
        this.isLoading = false;
      }
    );
  }

  search(): void {
    this.applyFilters();
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersShown = !this.isMobileFiltersShown;
  }

  hasActiveFilters(): boolean {
    return this.selectedGenres.length > 0 || this.yearFrom !== null || this.yearTo !== null || this.searchTerm !== '';
  }
}
