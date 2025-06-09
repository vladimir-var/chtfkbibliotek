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
            .Include(b => b.Category)
            .Include(b => b.Subcategory)
            .AsQueryable();

        // Фільтрація
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var searchLower = filter.Search.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(searchLower) ||
                b.Author.ToLower().Contains(searchLower));
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(b => b.CategoryId == filter.CategoryId.Value);
        }

        if (filter.SubcategoryId.HasValue)
        {
            query = query.Where(b => b.SubcategoryId == filter.SubcategoryId.Value);
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
                CategoryName = b.Category.Name,
                SubcategoryName = b.Subcategory != null ? b.Subcategory.Name : null
            })
            .ToListAsync();

        return books;
    }

    public async Task<BookDto> GetBookAsync(int id)
    {
        var book = await _context.Books
            .Include(b => b.Category)
            .Include(b => b.Subcategory)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
            throw new KeyNotFoundException($"Книга з ID {id} не знайдена");

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
            CategoryName = book.Category.Name,
            SubcategoryName = book.Subcategory != null ? book.Subcategory.Name : null
        };
    }

    public async Task<BookDto> CreateBookAsync(BookCreateDto dto)
    {
        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            throw new ArgumentException("Вказана категорія не існує");

        if (dto.SubcategoryId.HasValue)
        {
            var subcategory = await _context.Subcategories.FindAsync(dto.SubcategoryId.Value);
            if (subcategory == null)
                throw new ArgumentException("Вказана підкатегорія не існує");
            if (subcategory.CategoryId != dto.CategoryId)
                throw new ArgumentException("Підкатегорія не належить до вказаної категорії");
        }

        var book = new Book
        {
            Title = dto.Title ?? throw new ArgumentException("Назва не може бути порожньою"),
            Author = dto.Author ?? throw new ArgumentException("Автор не може бути порожнім"),
            YearPublished = dto.YearPublished,
            Publisher = dto.Publisher,
            PageCount = dto.PageCount,
            Language = dto.Language ?? throw new ArgumentException("Мова не може бути порожньою"),
            CoverImage = dto.CoverImage,
            Description = dto.Description ?? throw new ArgumentException("Опис не може бути порожнім"),
            CategoryId = dto.CategoryId,
            SubcategoryId = dto.SubcategoryId
        };

        if (dto.File != null)
        {
            book.Content = await _pdfValidationService.ValidateAndGetContentAsync(dto.File);
        }

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return await GetBookAsync(book.Id);
    }

    public async Task UpdateBookAsync(int id, BookCreateDto dto)
    {
        var book = await _context.Books
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
            throw new KeyNotFoundException($"Книга з ID {id} не знайдена");

        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            throw new ArgumentException("Вказана категорія не існує");

        if (dto.SubcategoryId.HasValue)
        {
            var subcategory = await _context.Subcategories.FindAsync(dto.SubcategoryId.Value);
            if (subcategory == null)
                throw new ArgumentException("Вказана підкатегорія не існує");
            if (subcategory.CategoryId != dto.CategoryId)
                throw new ArgumentException("Підкатегорія не належить до вказаної категорії");
        }

        book.Title = dto.Title ?? throw new ArgumentException("Назва не може бути порожньою");
        book.Author = dto.Author ?? throw new ArgumentException("Автор не може бути порожнім");
        book.YearPublished = dto.YearPublished;
        book.Publisher = dto.Publisher;
        book.PageCount = dto.PageCount;
        book.Language = dto.Language ?? throw new ArgumentException("Мова не може бути порожньою");
        book.CoverImage = dto.CoverImage;
        book.Description = dto.Description ?? throw new ArgumentException("Опис не може бути порожнім");
        book.CategoryId = dto.CategoryId;
        book.SubcategoryId = dto.SubcategoryId;

        if (dto.File != null)
        {
            book.Content = await _pdfValidationService.ValidateAndGetContentAsync(dto.File);
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteBookAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            throw new KeyNotFoundException($"Книга з ID {id} не знайдена");

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
    }

    public async Task<byte[]> GetBookContentAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            throw new KeyNotFoundException($"Книга з ID {id} не знайдена");

        if (book.Content == null)
            throw new InvalidOperationException($"У книги з ID {id} відсутній вміст");

        return book.Content;
    }

    public async Task<int> GetTotalCountAsync(BookFilterParameters filter)
    {
        var query = _context.Books.AsQueryable();

        // Фільтрація
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var searchLower = filter.Search.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(searchLower) ||
                b.Author.ToLower().Contains(searchLower));
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(b => b.CategoryId == filter.CategoryId.Value);
        }

        if (filter.SubcategoryId.HasValue)
        {
            query = query.Where(b => b.SubcategoryId == filter.SubcategoryId.Value);
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
