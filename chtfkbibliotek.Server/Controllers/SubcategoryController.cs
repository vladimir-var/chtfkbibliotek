using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace chtfkbibliotek.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubcategoryController : ControllerBase
    {
        private readonly ISubcategoryService _subcategoryService;

        public SubcategoryController(ISubcategoryService subcategoryService)
        {
            _subcategoryService = subcategoryService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubcategoryDTO>>> GetAll()
        {
            var subcategories = await _subcategoryService.GetAllAsync();
            return Ok(subcategories);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<SubcategoryDTO>>> GetByCategory(int categoryId)
        {
            var subcategories = await _subcategoryService.GetByCategoryIdAsync(categoryId);
            return Ok(subcategories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SubcategoryDTO>> GetById(int id)
        {
            var subcategory = await _subcategoryService.GetByIdAsync(id);
            if (subcategory == null)
                return NotFound();

            return Ok(subcategory);
        }

        [HttpPost]
        public async Task<ActionResult<SubcategoryDTO>> Create(SubcategoryCreateDTO subcategoryDto)
        {
            var subcategory = await _subcategoryService.CreateAsync(subcategoryDto);
            return CreatedAtAction(nameof(GetById), new { id = subcategory.Id }, subcategory);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SubcategoryDTO>> Update(int id, SubcategoryUpdateDTO subcategoryDto)
        {
            var subcategory = await _subcategoryService.UpdateAsync(id, subcategoryDto);
            if (subcategory == null)
                return NotFound();

            return Ok(subcategory);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _subcategoryService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
} 