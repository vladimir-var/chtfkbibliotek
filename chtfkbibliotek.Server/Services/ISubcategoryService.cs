using chtfkbibliotek.Server.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace chtfkbibliotek.Server.Services
{
    public interface ISubcategoryService
    {
        Task<IEnumerable<SubcategoryDto>> GetAllSubcategoriesAsync();
        Task<IEnumerable<SubcategoryDto>> GetSubcategoriesByCategoryAsync(int categoryId);
        Task<SubcategoryDto> GetSubcategoryAsync(int id);
        Task<SubcategoryDto> CreateSubcategoryAsync(SubcategoryCreateDto dto);
        Task UpdateSubcategoryAsync(int id, SubcategoryCreateDto dto);
        Task DeleteSubcategoryAsync(int id);
    }
} 