using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using chtfkbibliotek.Server.Data;
using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace chtfkbibliotek.Server.Services
{
    public class BookService : IBookService
    {
        private readonly ApplicationDbContext _context;

        public BookService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookDTO>> GetAllAsync()
        {
            var (books, totalCount) = await GetFilteredAsync(null, null, null, null, 1, 10);
            return books;
        }

        public async Task<BookDTO?> GetByIdAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return null;

            return new BookDTO
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description,
                Publisher = book.Publisher,
                PageCount = book.PageCount,
                CategoryId = book.CategoryId,
                SubcategoryId = book.SubcategoryId,
                CoverImage = book.CoverImageUrl,
                FileUrl = book.FileUrl
            };
        }

        public async Task<BookDTO> CreateAsync(BookCreateDTO bookDto)
        {
            byte[]? fileContent = null;
            if (bookDto.File != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await bookDto.File.CopyToAsync(memoryStream);
                    fileContent = memoryStream.ToArray();
                }
            }

            var book = new Book
            {
                Title = bookDto.Title,
                Author = bookDto.Author,
                Description = bookDto.Description,
                Publisher = bookDto.Publisher,
                PageCount = bookDto.PageCount,
                CategoryId = bookDto.CategoryId,
                SubcategoryId = bookDto.SubcategoryId,
                Content = fileContent,
                CoverImageUrl = !string.IsNullOrWhiteSpace(bookDto.CoverImage) 
                                ? bookDto.CoverImage 
                                : "/images/covers/default_cover.jpg"
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            if (bookDto.File != null)
            {
                book.FileUrl = $"/uploads/books/{book.Id}.pdf";
                await _context.SaveChangesAsync();
            }

            return new BookDTO
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description,
                Publisher = book.Publisher,
                PageCount = book.PageCount,
                CategoryId = book.CategoryId,
                SubcategoryId = book.SubcategoryId,
                CoverImage = book.CoverImageUrl,
                FileUrl = book.FileUrl
            };
        }

        public async Task<BookDTO?> UpdateAsync(int id, BookUpdateDTO bookDto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return null;

            book.Title = bookDto.Title;
            book.Author = bookDto.Author;
            book.Description = bookDto.Description;
            book.Publisher = bookDto.Publisher;
            book.PageCount = bookDto.PageCount;
            book.CategoryId = bookDto.CategoryId;
            book.SubcategoryId = bookDto.SubcategoryId;
            book.CoverImageUrl = bookDto.CoverImageUrl;
            book.FileUrl = bookDto.FileUrl;

            await _context.SaveChangesAsync();

            return new BookDTO
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description,
                Publisher = book.Publisher,
                PageCount = book.PageCount,
                CategoryId = book.CategoryId,
                SubcategoryId = book.SubcategoryId,
                CoverImage = book.CoverImageUrl,
                FileUrl = book.FileUrl
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]?> GetBookContentAsync(int id)
        {
            var bookContent = await _context.Books
                                    .Where(b => b.Id == id)
                                    .Select(b => b.Content)
                                    .FirstOrDefaultAsync();
            return bookContent;
        }

        public async Task<(IEnumerable<BookDTO> Books, int TotalCount)> GetFilteredAsync(
            string? authorSearch = null,
            string? titleSearch = null,
            int? categoryId = null,
            int? subcategoryId = null,
            int page = 1,
            int pageSize = 10)
        {
            var query = _context.Books.AsQueryable();

            var authorSearchLower = authorSearch?.ToLower().Trim();
            var titleSearchLower = titleSearch?.ToLower().Trim();

            if (!string.IsNullOrWhiteSpace(authorSearchLower) && !string.IsNullOrWhiteSpace(titleSearchLower))
            {
                query = query.Where(b => b.Author.ToLower().Contains(authorSearchLower) ||
                                           b.Title.ToLower().Contains(titleSearchLower));
            }
            else if (!string.IsNullOrWhiteSpace(authorSearchLower))
            {
                query = query.Where(b => b.Author.ToLower().Contains(authorSearchLower));
            }
            else if (!string.IsNullOrWhiteSpace(titleSearchLower))
            {
                query = query.Where(b => b.Title.ToLower().Contains(titleSearchLower));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            if (subcategoryId.HasValue)
            {
                query = query.Where(b => b.SubcategoryId == subcategoryId.Value);
            }

            var totalCount = await query.CountAsync();

            var books = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookDTO
                {
                    Id = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    Description = b.Description,
                    Publisher = b.Publisher,
                    PageCount = b.PageCount,
                    CategoryId = b.CategoryId,
                    SubcategoryId = b.SubcategoryId,
                    CoverImage = b.CoverImageUrl,
                    FileUrl = b.FileUrl
                })
                .ToListAsync();

            return (books, totalCount);
        }
    }
}
