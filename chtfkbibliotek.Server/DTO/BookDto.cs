namespace chtfkbibliotek.Server.DTO
{
    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string Author { get; set; } = default!;
        public int? YearPublished { get; set; }
        public string? Publisher { get; set; }
        public int? PageCount { get; set; }
        public string Language { get; set; } = default!;
        public string? CoverImage { get; set; }
        public string Description { get; set; } = default!;
        public string CategoryName { get; set; } = default!;
        public string? SubcategoryName { get; set; }
    }
}
