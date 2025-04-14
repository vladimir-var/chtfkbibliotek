using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Constants;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

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
            [FromQuery] int? yearFrom,
            [FromQuery] int? yearTo,
            [FromQuery] int? minPageCount,
            [FromQuery] int? maxPageCount,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var filter = new BookFilterParameters
            {
                Search = search,
                GenreId = genreId,
                YearFrom = yearFrom,
                YearTo = yearTo,
                MinPageCount = minPageCount,
                MaxPageCount = maxPageCount,
                Page = page,
                PageSize = pageSize
            };

            var books = await _bookService.GetBooksAsync(filter);
            return Ok(books);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            try
            {
                var book = await _bookService.GetBookAsync(id);
                return Ok(book);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateBook([FromForm] BookCreateDto dto)
        {
            try
            {
                var book = await _bookService.CreateBookAsync(dto);
                return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromForm] BookCreateDto dto)
        {
            try
            {
                await _bookService.UpdateBookAsync(id, dto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            try
            {
                await _bookService.DeleteBookAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("{id}/content")]
        public async Task<IActionResult> GetBookContent(int id)
        {
            try
            {
                var content = await _bookService.GetBookContentAsync(id);
                
                Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
                Response.Headers.Add("Pragma", "no-cache");
                Response.Headers.Add("Expires", "0");
                
                return File(content, BookConstants.PdfContentType, $"{id}.pdf");
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
