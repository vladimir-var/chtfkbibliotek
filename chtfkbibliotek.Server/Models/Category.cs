using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace chtfkbibliotek.Server.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = default!;

        public ICollection<Subcategory> Subcategories { get; set; } = new List<Subcategory>();
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
} 