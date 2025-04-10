using System.ComponentModel.DataAnnotations;

namespace chtfkbibliotek.Server.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = default!;

        [Required]
        public string Author { get; set; } = default!;

        public int? YearPublished { get; set; }

        public string? Publisher { get; set; }

        public int? PageCount { get; set; }

        [Required]
        public string Language { get; set; } = "Українська";  // Заміна LanguageType на string

        public string? CoverImage { get; set; }

        [Required]
        public string Description { get; set; } = default!;

        public byte[]? Content { get; set; }

        public ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();
    }
}
