namespace chtfkbibliotek.Server.DTO
{
    public class SubcategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
    }

    public class SubcategoryCreateDto
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
    }
} 