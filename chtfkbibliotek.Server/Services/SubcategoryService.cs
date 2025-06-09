using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chtfkbibliotek.Server.Services
{
    public class SubcategoryService : ISubcategoryService
    {
        private readonly AppDbContext _context;

        public SubcategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SubcategoryDto>> GetAllSubcategoriesAsync()
        {
            return await _context.Subcategories
                .Include(s => s.Category)
                .Select(s => new SubcategoryDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId,
                    CategoryName = s.Category.Name
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<SubcategoryDto>> GetSubcategoriesByCategoryAsync(int categoryId)
        {
            return await _context.Subcategories
                .Include(s => s.Category)
                .Where(s => s.CategoryId == categoryId)
                .Select(s => new SubcategoryDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CategoryId = s.CategoryId,
                    CategoryName = s.Category.Name
                })
                .ToListAsync();
        }

        public async Task<SubcategoryDto> GetSubcategoryAsync(int id)
        {
            var subcategory = await _context.Subcategories
                .Include(s => s.Category)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subcategory == null)
                throw new KeyNotFoundException($"Підкатегорію з ID {id} не знайдено");

            return new SubcategoryDto
            {
                Id = subcategory.Id,
                Name = subcategory.Name,
                Description = subcategory.Description,
                CategoryId = subcategory.CategoryId,
                CategoryName = subcategory.Category.Name
            };
        }

        public async Task<SubcategoryDto> CreateSubcategoryAsync(SubcategoryCreateDto dto)
        {
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                throw new ArgumentException("Вказана категорія не існує");

            var subcategory = new Subcategory
            {
                Name = dto.Name,
                Description = dto.Description,
                CategoryId = dto.CategoryId
            };

            _context.Subcategories.Add(subcategory);
            await _context.SaveChangesAsync();

            return await GetSubcategoryAsync(subcategory.Id);
        }

        public async Task UpdateSubcategoryAsync(int id, SubcategoryCreateDto dto)
        {
            var subcategory = await _context.Subcategories.FindAsync(id);
            if (subcategory == null)
                throw new KeyNotFoundException($"Підкатегорію з ID {id} не знайдено");

            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                throw new ArgumentException("Вказана категорія не існує");

            subcategory.Name = dto.Name;
            subcategory.Description = dto.Description;
            subcategory.CategoryId = dto.CategoryId;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteSubcategoryAsync(int id)
        {
            var subcategory = await _context.Subcategories.FindAsync(id);
            if (subcategory == null)
                throw new KeyNotFoundException($"Підкатегорію з ID {id} не знайдено");

            // Перевіряємо, чи є книги з цією підкатегорією
            var hasBooks = await _context.Books.AnyAsync(b => b.SubcategoryId == id);
            if (hasBooks)
                throw new InvalidOperationException("Неможливо видалити підкатегорію, оскільки вона використовується в книгах");

            _context.Subcategories.Remove(subcategory);
            await _context.SaveChangesAsync();
        }
    }
} 