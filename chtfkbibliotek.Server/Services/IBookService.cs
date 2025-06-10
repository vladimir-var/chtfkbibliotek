using chtfkbibliotek.Server.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace chtfkbibliotek.Server.Services
{
public interface IBookService
{
        Task<IEnumerable<BookDTO>> GetAllAsync();
        Task<BookDTO?> GetByIdAsync(int id);
        Task<BookDTO> CreateAsync(BookCreateDTO bookDto);
        Task<BookDTO?> UpdateAsync(int id, BookUpdateDTO bookDto);
        Task<bool> DeleteAsync(int id);
        Task<(IEnumerable<BookDTO> Books, int TotalCount)> GetFilteredAsync(
            string? authorSearch,
            string? titleSearch,
            int? categoryId = null,
            int? subcategoryId = null,
            int page = 1,
            int pageSize = 10);
        Task<byte[]?> GetBookContentAsync(int id);
    }
}
