using System.ComponentModel.DataAnnotations;

namespace chtfkbibliotek.Server.Models
{
    public class Subcategory
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; } = default!;
    }
} 