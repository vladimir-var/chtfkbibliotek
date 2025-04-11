using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IBookService
{
    Task<IEnumerable<BookDto>> GetBooksAsync(string? search, int? genreId, int? yearPublished, int? minPageCount, int? maxPageCount, int page, int pageSize);
    Task<BookDto> GetBookAsync(int id);
    Task<BookDto> CreateBookAsync(BookCreateDto dto);
    Task UpdateBookAsync(int id, BookCreateDto dto);
    Task DeleteBookAsync(int id);
    Task<byte[]> GetBookContentAsync(int id);
    Task<string> CheckDbAsync();
}
