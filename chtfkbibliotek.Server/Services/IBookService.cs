using chtfkbibliotek.Server.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IBookService
{
    Task<IEnumerable<BookDto>> GetBooksAsync(BookFilterParameters filter);
    Task<BookDto> GetBookAsync(int id);
    Task<BookDto> CreateBookAsync(BookCreateDto dto);
    Task UpdateBookAsync(int id, BookCreateDto dto);
    Task DeleteBookAsync(int id);
    Task<byte[]> GetBookContentAsync(int id);
}
