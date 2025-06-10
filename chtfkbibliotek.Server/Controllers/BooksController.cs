using System.Collections.Generic;
using System.Threading.Tasks;
using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Services;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetFiltered(
            [FromQuery] string? authorSearch = null,
            [FromQuery] string? titleSearch = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? subcategoryId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (books, totalCount) = await _bookService.GetFilteredAsync(
                authorSearch, titleSearch, categoryId, subcategoryId, page, pageSize);

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("Access-Control-Expose-Headers", "X-Total-Count"); // Додано для CORS

            return Ok(books);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDTO>> GetById(int id)
            {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null)
                return NotFound();

            return Ok(book);
        }

        [HttpPost]
        public async Task<ActionResult<BookDTO>> Create([FromForm] BookCreateDTO bookDto)
            {
            var book = await _bookService.CreateAsync(bookDto);
            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<BookDTO>> Update(int id, BookUpdateDTO bookDto)
        {
            var book = await _bookService.UpdateAsync(id, bookDto);
            if (book == null)
                return NotFound();

            return Ok(book);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _bookService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("{id}/content")]
        public async Task<ActionResult> GetBookContent(int id)
        {
            var content = await _bookService.GetBookContentAsync(id);
            if (content == null)
            {
                return NotFound();
            }
            return File(content, "application/pdf");
        }
    }
}
