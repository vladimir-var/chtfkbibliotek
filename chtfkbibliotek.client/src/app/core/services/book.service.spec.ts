import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookService, BookServiceError } from './book.service';
import { Book } from '../models/book.model';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookService]
    });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBookById', () => {
    it('should return a book when successful', () => {
      const mockBook: Book = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        yearPublished: 2023,
        publisher: 'Test Publisher',
        pageCount: 100,
        language: 'Ukrainian',
        coverImage: 'test.jpg',
        genreNames: ['Test Genre']
      };

      service.getBookById(1).subscribe(book => {
        expect(book).toEqual(mockBook);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/books/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBook);
    });

    it('should return NotFound error when book does not exist', () => {
      service.getBookById(999).subscribe({
        error: (error: BookServiceError) => {
          expect(error instanceof BookServiceError).toBeTruthy();
          expect(error.type).toBe('NotFound');
          expect(error.statusCode).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/books/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getFilteredBooks', () => {
    it('should apply filters correctly', () => {
      const filters = {
        genres: [1, 2],
        yearFrom: 2020,
        yearTo: 2023,
        search: 'test'
      };

      service.getFilteredBooks(filters).subscribe();

      const req = httpMock.expectOne(req => req.url === `${service['apiUrl']}/books`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('genreId')).toBe('1,2');
      expect(req.request.params.get('yearFrom')).toBe('2020');
      expect(req.request.params.get('yearTo')).toBe('2023');
      expect(req.request.params.get('search')).toBe('test');
    });
  });

  describe('addBook', () => {
    it('should handle validation errors', () => {
      const invalidBook = {
        title: '',
        author: '',
        description: '',
        yearPublished: 2023,
        language: 'Ukrainian',
        coverImage: '',
        content: null,
        publisher: '',
        pageCount: 0
      };

      service.addBook(invalidBook).subscribe({
        error: (error: BookServiceError) => {
          expect(error instanceof BookServiceError).toBeTruthy();
          expect(error.type).toBe('ValidationError');
          expect(error.statusCode).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/books`);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getBookContent', () => {
    it('should return decoded content when successful', () => {
      const mockContent = new ArrayBuffer(8);

      service.getBookContent(1).subscribe(content => {
        expect(typeof content).toBe('string');
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/books/1/content`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('arraybuffer');
      req.flush(mockContent);
    });

    it('should handle missing content error', () => {
      service.getBookContent(1).subscribe({
        error: (error: BookServiceError) => {
          expect(error instanceof BookServiceError).toBeTruthy();
          expect(error.type).toBe('ValidationError');
          expect(error.statusCode).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/books/1/content`);
      req.flush('Content not found', { status: 400, statusText: 'Bad Request' });
    });
  });
}); 