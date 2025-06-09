using System.ComponentModel.DataAnnotations;

namespace chtfkbibliotek.Server.DTO
{
    public class BookCreateDto
    {
        [Required]
        public string Title { get; set; } = default!;

        [Required]
        public string Author { get; set; } = default!;

        public int? YearPublished { get; set; }

        public string? Publisher { get; set; }

        public int? PageCount { get; set; }

        [Required]
        public string Language { get; set; } = default!;

        public string? CoverImage { get; set; }

        [Required]
        public string Description { get; set; } = default!;

        public IFormFile? File { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int? SubcategoryId { get; set; }
    }
}
