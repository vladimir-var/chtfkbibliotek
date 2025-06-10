namespace chtfkbibliotek.Server.DTO
{
    public class CategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
    }

    public class CategoryCreateDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
    }

    public class CategoryUpdateDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
    }
} 