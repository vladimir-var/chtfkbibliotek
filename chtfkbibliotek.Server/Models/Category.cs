using System.ComponentModel.DataAnnotations;

namespace chtfkbibliotek.Server.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public string? Description { get; set; }

        // Навігаційні властивості
        public virtual ICollection<Subcategory> Subcategories { get; set; }
        public virtual ICollection<Book> Books { get; set; }
    }
} 