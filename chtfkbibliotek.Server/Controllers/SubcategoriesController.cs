using chtfkbibliotek.Server.DTO;
using chtfkbibliotek.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace chtfkbibliotek.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubcategoriesController : ControllerBase
    {
        private readonly ISubcategoryService _subcategoryService;

        public SubcategoriesController(ISubcategoryService subcategoryService)
        {
            _subcategoryService = subcategoryService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubcategoryDto>>> GetAllSubcategories()
        {
            var subcategories = await _subcategoryService.GetAllSubcategoriesAsync();
            return Ok(subcategories);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<SubcategoryDto>>> GetSubcategoriesByCategory(int categoryId)
        {
            var subcategories = await _subcategoryService.GetSubcategoriesByCategoryAsync(categoryId);
            return Ok(subcategories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SubcategoryDto>> GetSubcategory(int id)
        {
            try
            {
                var subcategory = await _subcategoryService.GetSubcategoryAsync(id);
                return Ok(subcategory);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<ActionResult<SubcategoryDto>> CreateSubcategory(SubcategoryCreateDto dto)
        {
            try
            {
                var subcategory = await _subcategoryService.CreateSubcategoryAsync(dto);
                return CreatedAtAction(nameof(GetSubcategory), new { id = subcategory.Id }, subcategory);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubcategory(int id, SubcategoryCreateDto dto)
        {
            try
            {
                await _subcategoryService.UpdateSubcategoryAsync(id, dto);
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
        public async Task<IActionResult> DeleteSubcategory(int id)
        {
            try
            {
                await _subcategoryService.DeleteSubcategoryAsync(id);
                return NoContent();
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