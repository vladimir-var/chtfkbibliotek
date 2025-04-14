using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

public class BookService : IBookService
{
    private readonly AppDbContext _context;

    public BookService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BookDto>> GetBooksAsync(string? search, int? genreId, int? yearPublished, int? minPageCount, int? maxPageCount, int page, int pageSize)
    {
        var query = _context.Books
            .Include(b => b.BookGenres)
            .ThenInclude(bg => bg.Genre)
            .AsQueryable();

        // Фільтрація
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(b =>
                b.Title.ToLower().Contains(search.ToLower()) ||
                b.Author.ToLower().Contains(search.ToLower()));
        }

        if (genreId.HasValue)
        {
            query = query.Where(b => b.BookGenres.Any(bg => bg.GenreId == genreId.Value));
        }

        if (yearPublished.HasValue)
        {
            query = query.Where(b => b.YearPublished == yearPublished.Value);
        }

        if (minPageCount.HasValue)
        {
            query = query.Where(b => b.PageCount >= minPageCount.Value);
        }

        if (maxPageCount.HasValue)
        {
            query = query.Where(b => b.PageCount <= maxPageCount.Value);
        }

        // Пагінація
        var books = await query
            .OrderByDescending(b => b.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        if (book == null) return null;

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
        {
            throw new ArgumentNullException(nameof(dto), "DTO не может быть null");
        }

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
            using var ms = new MemoryStream();
            await dto.File.CopyToAsync(ms);
            book.Content = ms.ToArray();
        }

        // Проверяем, что GenreIds не null и содержит элементы
        if (dto.GenreIds == null || !dto.GenreIds.Any())
        {
            throw new ArgumentException("Необходимо указать хотя бы один жанр");
        }

        // Загружаем жанры из базы данных
        var genres = await _context.Genres
            .Where(g => dto.GenreIds.Contains(g.Id))
            .ToListAsync();

        if (genres.Count != dto.GenreIds.Count)
        {
            throw new ArgumentException("Один или несколько указанных жанров не найдены в базе данных");
        }

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

    public async Task UpdateBookAsync(int id, BookCreateDto dto)
    {
        var book = await _context.Books
            .Include(b => b.BookGenres)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return;

        book.Title = dto.Title;
        book.Author = dto.Author;
        book.YearPublished = dto.YearPublished;
        book.Publisher = dto.Publisher;
        book.PageCount = dto.PageCount;
        book.Language = dto.Language;
        book.CoverImage = dto.CoverImage;
        book.Description = dto.Description;

        if (dto.File != null)
        {
            using var ms = new MemoryStream();
            await dto.File.CopyToAsync(ms);
            book.Content = ms.ToArray();
        }

        // Оновлення жанрів
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
        if (book != null)
        {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<byte[]> GetBookContentAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        return book?.Content;
    }

    public async Task<string> CheckDbAsync()
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync("SELECT 1");
            return "✅ Підключення до бази даних встановлено.";
        }
        catch (Exception ex)
        {
            return "❌ Немає підключення до бази даних.\n" + ex.Message;
        }
    }
}
