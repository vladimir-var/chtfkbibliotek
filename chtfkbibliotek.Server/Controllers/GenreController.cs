using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace chtfkbibliotek.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenreController : ControllerBase
    {
        private readonly GenreService _genreService;

        public GenreController(GenreService genreService)
        {
            _genreService = genreService;
        }

        // GET: api/genre
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GenreDto>>> GetGenres([FromQuery] string? search, int page = 1, int pageSize = 10)
        {
            var genres = await _genreService.GetGenresAsync(search, page, pageSize);
            return Ok(genres);
        }

        // GET: api/genre/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GenreDto>> GetGenre(int id)
        {
            var genre = await _genreService.GetGenreAsync(id);

            if (genre == null)
                return NotFound();

            return Ok(genre);
        }

        // DELETE: api/genre/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            var result = await _genreService.DeleteGenreAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
