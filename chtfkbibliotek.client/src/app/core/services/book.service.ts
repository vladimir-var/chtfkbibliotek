import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Book } from '../models/book.model';
import { Genre } from '../models/genre.model';

interface BookFilters {
  genres: number[];
  yearFrom: number | null;
  yearTo: number | null;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private booksSubject = new BehaviorSubject<Book[]>([]);
  filteredBooks$ = this.booksSubject.asObservable();
  
  private filtersSubject = new BehaviorSubject<BookFilters>({
    genres: [],
    yearFrom: null,
    yearTo: null
  });
  filters$ = this.filtersSubject.asObservable();
  
  private books: Book[] = [
    {
      id: 1,
      title: 'Кобзар',
      author: 'Тарас Шевченко',
      genres: [{ id: 1, name: 'Поезія' }, { id: 2, name: 'Класика' }],
      yearPublished: 1840,
      publisher: 'Видавництво "Основи"',
      pageCount: 376,
      language: 'Українська',
      coverImage: 'https://vivat.com.ua/storage/1.d/import/media/2/4215c4f4321b28193de00e189028fd42.png',
      description: 'Збірка поетичних творів Тараса Шевченка, що стала символом українського національного відродження. "Кобзар" містить вірші, балади, поеми, які зображують історичне минуле України, долю народу та боротьбу за волю.',
      content: `Реве та стогне Дніпр широкий,
Сердитий вітер завива,
Додолу верби гне високі,
Горами хвилю підійма.
І блідий місяць на ту пору
Із хмари де-де виглядав,
Неначе човен в синім морі,
То виринав, то потопав.
Ще треті півні не співали,
Ніхто ніде не гомонів,
Сичі в гаю перекликались,
Та ясен раз у раз скрипів.

(Уривок з поеми "Причинна")`
    },
    {
      id: 2,
      title: 'Лісова пісня',
      author: 'Леся Українка',
      genres: [{ id: 2, name: 'Класика' }, { id: 3, name: 'Драма' }],
      yearPublished: 1911,
      publisher: 'Видавництво "Київ"',
      pageCount: 256,
      language: 'Українська',
      coverImage: 'https://static.yakaboo.ua/media/catalog/product/c/o/cover_858_1.jpg',
      description: 'Драма-феєрія, написана в жанрі філософської драми. Твір відображає боротьбу між духовним і тілесним, піднімає проблеми життя і смерті, кохання і зради, вірності своїм переконанням та ідеалам.',
      content: `Дія 1

Прологу ліс на Волині. Провесна. На галяві дрімає Той, Що Греблі Рве, водяний дух; під дубом — Лісовик, у водоймі русалки вигріваються, а в небі пролітає Потерчата, проходить Той, Що В Скалі Сидить.

Із цих розмов стає зрозуміло, що особливо вони не люблять, коли місцеві мешканці вирізають деревину з їхнього лісу.

Потім з'являється дядько Лев зі своїм небожем Лукашем, які прийшли до лісу, щоб на літо перенести сюди пасіку.

Також приходить хлопець, який продає вуглярам деревний ґніт, і розповідає, що у лісовому окрузі щось недобре робиться. Тоді ще ці події не здаються важливими.

Поки дядько Лев поїхав до села, Лукаш залишається сам, а покінчивши з роботою йде шукати красивих співочих птахів.

Тоді йому доводиться побачити незвичайну дівчину — Мавку. Той починає грати на сопілці, і Мавка зізнається, що ніколи ще не чула такої зворушливої гри. Під час розмови дівчина представляється:

"Я — Мавка лісова..."`
    },
    {
      id: 3,
      title: 'Тигролови',
      author: 'Іван Багряний',
      genres: [{ id: 4, name: 'Пригоди' }, { id: 5, name: 'Роман' }],
      yearPublished: 1944,
      publisher: 'Видавництво "Смолоскип"',
      pageCount: 302,
      language: 'Українська',
      coverImage: 'https://static.yakaboo.ua/media/catalog/product/i/m/img347_144.jpg',
      description: 'Пригодницький роман, що розповідає про долю українського політв\'язня Григорія Многогрішного, який тікає з ешелону смерті й потрапляє в складні обставини на Далекому Сході.'
    },
    {
      id: 4,
      title: 'Місто',
      author: 'Валер\'ян Підмогильний',
      genres: [{ id: 5, name: 'Роман' }, { id: 6, name: 'Психологія' }],
      yearPublished: 1928,
      publisher: 'Видавництво "Книги-ХХІ"',
      pageCount: 328,
      language: 'Українська',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1696849695i/197849374.jpg',
      description: 'Один із перших урбаністичних романів в українській літературі, який розкриває проблеми людини в місті, її трансформацію, втрату моральних орієнтирів заради власної вигоди.'
    },
    {
      id: 5,
      title: 'Чорна рада',
      author: 'Пантелеймон Куліш',
      genres: [{ id: 2, name: 'Класика' }, { id: 7, name: 'Історичний' }],
      yearPublished: 1857,
      publisher: 'Видавництво "Фоліо"',
      pageCount: 280,
      language: 'Українська',
      coverImage: 'https://nashformat.ua/files/products/ebook-chorna-rada-628089.800x800.jpeg',
      description: 'Перший історичний роман в українській літературі, який змальовує події, пов\'язані з обранням гетьмана Лівобережної України у 1663 році.'
    },
    {
      id: 6,
      title: 'Зів\'яле листя',
      author: 'Іван Франко',
      genres: [{ id: 1, name: 'Поезія' }, { id: 8, name: 'Лірика' }],
      yearPublished: 1896,
      publisher: 'Видавництво "Апріорі"',
      pageCount: 124,
      language: 'Українська',
      coverImage: 'https://litopys.lviv.ua/wp-content/uploads/2020/01/FRANKO_Zivyale-lystya.jpg',
      description: 'Лірична драма, збірка поезій, в яких автор розкриває тему нещасливого кохання. Глибоко психологічна, інтимна лірика, сповнена болю та розчарування.'
    }
  ];
  
  private genres: Genre[] = [
    { id: 1, name: 'Поезія' },
    { id: 2, name: 'Класика' },
    { id: 3, name: 'Драма' },
    { id: 4, name: 'Пригоди' },
    { id: 5, name: 'Роман' },
    { id: 6, name: 'Психологія' },
    { id: 7, name: 'Історичний' },
    { id: 8, name: 'Лірика' },
    { id: 9, name: 'Наукова фантастика' },
    { id: 10, name: 'Фентезі' },
    { id: 11, name: 'Детектив' },
    { id: 12, name: 'Підручник' }
  ];
  
  private currentFilters: BookFilters = {
    genres: [],
    yearFrom: null,
    yearTo: null
  };
  
  constructor() {
    // Initialize with all books
    this.booksSubject.next(this.books);
  }
  
  // Get all books
  getAllBooks(): Observable<Book[]> {
    return of(this.books);
  }
  
  // Get all genres
  getAllGenres(): Observable<Genre[]> {
    return of(this.genres);
  }
  
  // Get a book by ID
  getBookById(id: number): Observable<Book | undefined> {
    const book = this.books.find(b => b.id === id);
    return of(book);
  }
  
  // Update filters and filter the books
  updateFilters(filters: BookFilters): void {
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.filtersSubject.next(this.currentFilters);
    this.applyFilters();
  }
  
  // Reset all filters
  resetFilters(): void {
    this.currentFilters = {
      genres: [],
      yearFrom: null,
      yearTo: null
    };
    this.filtersSubject.next(this.currentFilters);
    this.booksSubject.next(this.books);
  }
  
  // Add a new book
  addBook(book: Omit<Book, 'id'>): void {
    const newId = Math.max(...this.books.map(b => b.id), 0) + 1;
    const newBook: Book = { ...book, id: newId };
    this.books = [...this.books, newBook];
    this.applyFilters();
  }
  
  // Delete a book
  deleteBook(id: number): void {
    this.books = this.books.filter(b => b.id !== id);
    this.applyFilters();
  }
  
  // Apply current filters to books
  private applyFilters(): void {
    let filteredBooks = [...this.books];
    
    // Filter by genres
    if (this.currentFilters.genres && this.currentFilters.genres.length > 0) {
      filteredBooks = filteredBooks.filter(book => 
        book.genres.some(genre => this.currentFilters.genres!.includes(genre.id))
      );
    }
    
    // Filter by year from
    if (this.currentFilters.yearFrom) {
      filteredBooks = filteredBooks.filter(book => 
        book.yearPublished >= (this.currentFilters.yearFrom || 0)
      );
    }
    
    // Filter by year to
    if (this.currentFilters.yearTo) {
      filteredBooks = filteredBooks.filter(book => 
        book.yearPublished <= (this.currentFilters.yearTo || 9999)
      );
    }
    
    // Filter by search term
    if (this.currentFilters.search && this.currentFilters.search.trim() !== '') {
      const searchTerm = this.currentFilters.search.toLowerCase().trim();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genres.some(genre => genre.name.toLowerCase().includes(searchTerm))
      );
    }
    
    this.booksSubject.next(filteredBooks);
  }
}
