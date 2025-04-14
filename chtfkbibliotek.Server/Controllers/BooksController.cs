using chtfkbibliotek.Server.DTO;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace chtfkbibliotek.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
            [FromQuery] string? search,
            [FromQuery] int? genreId,
            [FromQuery] int? yearPublished,
            [FromQuery] int? minPageCount,
            [FromQuery] int? maxPageCount,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var books = await _bookService.GetBooksAsync(search, genreId, yearPublished, minPageCount, maxPageCount, page, pageSize);
            return Ok(books);
        }

        [HttpGet("check-db")]
        public async Task<IActionResult> CheckDb()
        {
            var result = await _bookService.CheckDbAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            var book = await _bookService.GetBookAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBook([FromForm] BookCreateDto dto)
        {
            var book = await _bookService.CreateBookAsync(dto);
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromForm] BookCreateDto dto)
        {
            await _bookService.UpdateBookAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            await _bookService.DeleteBookAsync(id);
            return NoContent();
        }

        [HttpGet("{id}/content")]
        public async Task<IActionResult> GetBookContent(int id)
        {
            var content = await _bookService.GetBookContentAsync(id);
            if (content == null) return NotFound();
            // Заменили application/octet-stream и .txt на application/pdf и .pdf
            return File(content, "application/pdf", $"{id}.pdf");
        }

    }
}
