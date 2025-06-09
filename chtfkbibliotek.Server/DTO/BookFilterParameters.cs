namespace chtfkbibliotek.Server.DTO
{
    public class BookFilterParameters
    {
        public string? Search { get; set; }
        public int? CategoryId { get; set; }
        public int? SubcategoryId { get; set; }
        public int? YearFrom { get; set; }
        public int? YearTo { get; set; }
        public int? MinPageCount { get; set; }
        public int? MaxPageCount { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
} 