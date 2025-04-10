using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace chtfkbibliotek.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly AppDbContext _context;

    public BooksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
        [FromQuery] string? search,
        [FromQuery] int? genreId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Books
            .Include(b => b.BookGenres)
            .ThenInclude(bg => bg.Genre)
            .AsQueryable();

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
                Language = b.Language,  // Тепер просто рядок
                CoverImage = b.CoverImage,
                Description = b.Description,
                GenreNames = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
            })
            .ToListAsync();

        return Ok(books);
    }

    [HttpGet("check-db")]
    public async Task<IActionResult> CheckDb()
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync("SELECT 1");
            return Ok("✅ Підключення до бази даних встановлено.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "❌ Немає підключення до бази даних.\n" + ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookDto>> GetBook(int id)
    {
        var book = await _context.Books
            .Include(b => b.BookGenres)
            .ThenInclude(bg => bg.Genre)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return NotFound();

        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            YearPublished = book.YearPublished,
            Publisher = book.Publisher,
            PageCount = book.PageCount,
            Language = book.Language,  // Тепер просто рядок
            CoverImage = book.CoverImage,
            Description = book.Description,
            GenreNames = book.BookGenres.Select(bg => bg.Genre.Name).ToList()
        };
    }

    [HttpGet("{id}/content")]
    public async Task<IActionResult> GetBookContent(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null || book.Content == null)
            return NotFound();

        return File(book.Content, "application/octet-stream", $"{book.Title}.txt");
    }

    [HttpPost]
    public async Task<IActionResult> CreateBook([FromForm] BookCreateDto dto)
    {
        var book = new Book
        {
            Title = dto.Title,
            Author = dto.Author,
            YearPublished = dto.YearPublished,
            Publisher = dto.Publisher,
            PageCount = dto.PageCount,
            Language = dto.Language,  // Тепер приймаємо просто рядок
            CoverImage = dto.CoverImage,
            Description = dto.Description
        };

        if (dto.File != null)
        {
            using var ms = new MemoryStream();
            await dto.File.CopyToAsync(ms);
            book.Content = ms.ToArray();
        }

        foreach (var genreId in dto.GenreIds)
        {
            book.BookGenres.Add(new BookGenre
            {
                GenreId = genreId
            });
        }

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromForm] BookCreateDto dto)
    {
        var book = await _context.Books
            .Include(b => b.BookGenres)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null) return NotFound();

        book.Title = dto.Title;
        book.Author = dto.Author;
        book.YearPublished = dto.YearPublished;
        book.Publisher = dto.Publisher;
        book.PageCount = dto.PageCount;
        book.Language = dto.Language;  // Тепер приймаємо просто рядок
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
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null) return NotFound();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
