using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using chtfkbibliotek.Server.Services;

public class BookService : IBookService
{
    private readonly AppDbContext _context;
    private readonly IPdfValidationService _pdfValidationService;

    public BookService(AppDbContext context, IPdfValidationService pdfValidationService)
    {
        _context = context;
        _pdfValidationService = pdfValidationService;
    }

    public async Task<IEnumerable<BookDto>> GetBooksAsync(BookFilterParameters filter)
    {
        var query = _context.Books
            .Include(b => b.BookGenres)
            .ThenInclude(bg => bg.Genre)
            .AsQueryable();

        // Фільтрація
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var searchLower = filter.Search.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(searchLower) ||
                b.Author.ToLower().Contains(searchLower));
        }

        if (filter.GenreId.HasValue)
        {
            query = query.Where(b => b.BookGenres.Any(bg => bg.GenreId == filter.GenreId.Value));
        }

        if (filter.YearFrom.HasValue)
        {
            query = query.Where(b => b.YearPublished >= filter.YearFrom.Value);
        }

        if (filter.YearTo.HasValue)
        {
            query = query.Where(b => b.YearPublished <= filter.YearTo.Value);
        }

        if (filter.MinPageCount.HasValue)
        {
            query = query.Where(b => b.PageCount >= filter.MinPageCount.Value);
        }

        if (filter.MaxPageCount.HasValue)
        {
            query = query.Where(b => b.PageCount <= filter.MaxPageCount.Value);
        }

        // Пагінація
        var books = await query
            .OrderByDescending(b => b.Id)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(b => new BookDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                YearPublished = b.YearPublished,
                Publisher = b.Publisher,
                PageCount = b.PageCount,
                Language = b.Language,
                CoverImage = b.CoverImage,
                Description = b.Description,
                GenreNames = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
            })
            .ToListAsync();

        return books;
    }

    public async Task<BookDto> GetBookAsync(int id)
    {
        var book = await _context.Books
            .Include(b => b.BookGenres)
            .ThenInclude(bg => bg.Genre)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
            throw new KeyNotFoundException($"Книга с ID {id} не найдена");

        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            YearPublished = book.YearPublished,
            Publisher = book.Publisher,
            PageCount = book.PageCount,
            Language = book.Language,
            CoverImage = book.CoverImage,
            Description = book.Description,
            GenreNames = book.BookGenres.Select(bg => bg.Genre.Name).ToList()
        };
    }

    public async Task<BookDto> CreateBookAsync(BookCreateDto dto)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        var book = new Book
        {
            Title = dto.Title ?? throw new ArgumentException("Title не может быть null"),
            Author = dto.Author ?? throw new ArgumentException("Author не может быть null"),
            YearPublished = dto.YearPublished,
            Publisher = dto.Publisher,
            PageCount = dto.PageCount,
            Language = dto.Language ?? throw new ArgumentException("Language не может быть null"),
            CoverImage = dto.CoverImage,
            Description = dto.Description ?? throw new ArgumentException("Description не может быть null")
        };

        if (dto.File != null)
        {
            book.Content = await _pdfValidationService.ValidateAndGetContentAsync(dto.File);
        }

        if (dto.GenreIds == null || !dto.GenreIds.Any())
            throw new ArgumentException("Необходимо указать хотя бы один жанр");

        var genres = await _context.Genres
            .Where(g => dto.GenreIds.Contains(g.Id))
            .ToListAsync();

        if (genres.Count != dto.GenreIds.Count)
            throw new ArgumentException("Один или несколько указанных жанров не найдены в базе данных");

        foreach (var genre in genres)
        {
            book.BookGenres.Add(new BookGenre
            {
                GenreId = genre.Id,
                Genre = genre
            });
        }

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return await GetBookAsync(book.Id);
    }

    public async Task UpdateBookAsync(int id, BookCreateDto dto)
    {
        var book = await _context.Books
            .Include(b => b.BookGenres)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
            throw new KeyNotFoundException($"Книга с ID {id} не найдена");

        book.Title = dto.Title ?? throw new ArgumentException("Title не может быть null");
        book.Author = dto.Author ?? throw new ArgumentException("Author не может быть null");
        book.YearPublished = dto.YearPublished;
        book.Publisher = dto.Publisher;
        book.PageCount = dto.PageCount;
        book.Language = dto.Language ?? throw new ArgumentException("Language не может быть null");
        book.CoverImage = dto.CoverImage;
        book.Description = dto.Description ?? throw new ArgumentException("Description не может быть null");

        if (dto.File != null)
        {
            book.Content = await _pdfValidationService.ValidateAndGetContentAsync(dto.File);
        }

        if (dto.GenreIds == null || !dto.GenreIds.Any())
            throw new ArgumentException("Необходимо указать хотя бы один жанр");

        book.BookGenres.Clear();
        foreach (var genreId in dto.GenreIds)
        {
            book.BookGenres.Add(new BookGenre { GenreId = genreId });
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteBookAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            throw new KeyNotFoundException($"Книга с ID {id} не найдена");

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
    }

    public async Task<byte[]> GetBookContentAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            throw new KeyNotFoundException($"Книга с ID {id} не найдена");

        if (book.Content == null)
            throw new InvalidOperationException($"У книги с ID {id} отсутствует содержимое");

        return book.Content;
    }

    public async Task<int> GetTotalCountAsync(BookFilterParameters filter)
    {
        var query = _context.Books
            .Include(b => b.BookGenres)
            .ThenInclude(bg => bg.Genre)
            .AsQueryable();

        // Фільтрація
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var searchLower = filter.Search.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(searchLower) ||
                b.Author.ToLower().Contains(searchLower));
        }

        if (filter.GenreId.HasValue)
        {
            query = query.Where(b => b.BookGenres.Any(bg => bg.GenreId == filter.GenreId.Value));
        }

        if (filter.YearFrom.HasValue)
        {
            query = query.Where(b => b.YearPublished >= filter.YearFrom.Value);
        }

        if (filter.YearTo.HasValue)
        {
            query = query.Where(b => b.YearPublished <= filter.YearTo.Value);
        }

        if (filter.MinPageCount.HasValue)
        {
            query = query.Where(b => b.PageCount >= filter.MinPageCount.Value);
        }

        if (filter.MaxPageCount.HasValue)
        {
            query = query.Where(b => b.PageCount <= filter.MaxPageCount.Value);
        }

        return await query.CountAsync();
    }
}
