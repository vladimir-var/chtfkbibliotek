using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace chtfkbibliotek.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenreController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GenreController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/genre
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GenreDto>>> GetGenres([FromQuery] string? search, int page = 1, int pageSize = 10)
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

            return Ok(genres);
        }

        // GET: api/genre/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GenreDto>> GetGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);

            if (genre == null)
                return NotFound();

            return new GenreDto { Id = genre.Id, Name = genre.Name };
        }

        

        // DELETE: api/genre/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
