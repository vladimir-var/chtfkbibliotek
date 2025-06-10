using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace chtfkbibliotek.Server.DTO
{
    public class BookDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string? Description { get; set; }
        public string? Publisher { get; set; }
        public int? PageCount { get; set; }
        public int CategoryId { get; set; }
        public int? SubcategoryId { get; set; }
        public string? CoverImage { get; set; }
        public string? FileUrl { get; set; }
    }

    public class BookCreateDTO
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

        [Required]
        public string Description { get; set; } = default!;

        public IFormFile? File { get; set; }

        // Зауваження: CoverImageUrl та FileUrl не потрібні для CreateDTO, вони генеруються на сервері або є URL.
        public string? CoverImage { get; set; }

        public int CategoryId { get; set; }
        public int? SubcategoryId { get; set; }
    }

    public class BookUpdateDTO
    {
        public string Title { get; set; }
        public string Author { get; set; }
        public string? Description { get; set; }
        public string? Publisher { get; set; }
        public int? PageCount { get; set; }
        public int CategoryId { get; set; }
        public int? SubcategoryId { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? FileUrl { get; set; }
    }
}
