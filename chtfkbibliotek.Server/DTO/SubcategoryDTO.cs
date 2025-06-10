namespace chtfkbibliotek.Server.DTO
{
    public class SubcategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }
    }

    public class SubcategoryCreateDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }
    }

    public class SubcategoryUpdateDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }
    }
} 