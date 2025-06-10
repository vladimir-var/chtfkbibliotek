using chtfkbibliotek.Server.Data;
using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace chtfkbibliotek.Server.Services
{
    public interface ISubcategoryService
    {
        Task<IEnumerable<SubcategoryDTO>> GetAllAsync();
        Task<IEnumerable<SubcategoryDTO>> GetByCategoryIdAsync(int categoryId);
        Task<SubcategoryDTO?> GetByIdAsync(int id);
        Task<SubcategoryDTO> CreateAsync(SubcategoryCreateDTO subcategoryDto);
        Task<SubcategoryDTO?> UpdateAsync(int id, SubcategoryUpdateDTO subcategoryDto);
        Task<bool> DeleteAsync(int id);
    }

    public class SubcategoryService : ISubcategoryService
    {
        private readonly ApplicationDbContext _context;

        public SubcategoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SubcategoryDTO>> GetAllAsync()
        {
            return await _context.Subcategories
                .Select(s => new SubcategoryDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<SubcategoryDTO>> GetByCategoryIdAsync(int categoryId)
        {
            return await _context.Subcategories
                .Where(s => s.CategoryId == categoryId)
                .Select(s => new SubcategoryDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId
                })
                .ToListAsync();
        }

        public async Task<SubcategoryDTO?> GetByIdAsync(int id)
        {
            var subcategory = await _context.Subcategories.FindAsync(id);
            if (subcategory == null) return null;

            return new SubcategoryDTO
            {
                Id = subcategory.Id,
                Name = subcategory.Name,
                Description = subcategory.Description,
                CategoryId = subcategory.CategoryId
            };
        }

        public async Task<SubcategoryDTO> CreateAsync(SubcategoryCreateDTO subcategoryDto)
        {
            var subcategory = new Subcategory
            {
                Name = subcategoryDto.Name,
                Description = subcategoryDto.Description,
                CategoryId = subcategoryDto.CategoryId
            };

            _context.Subcategories.Add(subcategory);
            await _context.SaveChangesAsync();

            return new SubcategoryDTO
            {
                Id = subcategory.Id,
                Name = subcategory.Name,
                Description = subcategory.Description,
                CategoryId = subcategory.CategoryId
            };
        }

        public async Task<SubcategoryDTO?> UpdateAsync(int id, SubcategoryUpdateDTO subcategoryDto)
        {
            var subcategory = await _context.Subcategories.FindAsync(id);
            if (subcategory == null) return null;

            subcategory.Name = subcategoryDto.Name;
            subcategory.Description = subcategoryDto.Description;
            subcategory.CategoryId = subcategoryDto.CategoryId;

            await _context.SaveChangesAsync();

            return new SubcategoryDTO
            {
                Id = subcategory.Id,
                Name = subcategory.Name,
                Description = subcategory.Description,
                CategoryId = subcategory.CategoryId
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var subcategory = await _context.Subcategories.FindAsync(id);
            if (subcategory == null) return false;

            _context.Subcategories.Remove(subcategory);
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 