using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace chtfkbibliotek.Server.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        [StringLength(200)]
        public string Author { get; set; }

        public string? Description { get; set; }

        [StringLength(200)]
        public string? Publisher { get; set; }

        public int? PageCount { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int? SubcategoryId { get; set; }

        [StringLength(500)]
        public string? CoverImageUrl { get; set; }

        [StringLength(500)]
        public string? FileUrl { get; set; }

        public byte[]? Content { get; set; }

        // Навігаційні властивості
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; }

        [ForeignKey("SubcategoryId")]
        public virtual Subcategory? Subcategory { get; set; }
    }
}
