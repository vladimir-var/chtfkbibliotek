using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace chtfkbibliotek.Server.Services
{
    public class GenreService
    {
        private readonly AppDbContext _context;

        public GenreService(AppDbContext context)
        {
            _context = context;
        }

        // Получение жанров с фильтрацией по имени
        public async Task<IEnumerable<GenreDto>> GetGenresAsync(string? search, int page, int pageSize)
        {
            var query = _context.Genres.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(g => g.Name.ToLower().Contains(search.ToLower()));
            }

            var genres = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(g => new GenreDto { Id = g.Id, Name = g.Name })
                .ToListAsync();

            return genres;
        }

        // Получение жанра по id
        public async Task<GenreDto?> GetGenreAsync(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null) return null;

            return new GenreDto { Id = genre.Id, Name = genre.Name };
        }

        // Удаление жанра
        public async Task<bool> DeleteGenreAsync(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null) return false;

            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
