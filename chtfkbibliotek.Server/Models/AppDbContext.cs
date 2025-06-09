using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace chtfkbibliotek.Server.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Subcategory> Subcategories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Видаляємо наявне налаштування для Enum
            // modelBuilder.HasPostgresEnum<LanguageType>("language_type");  // Видалити

            // Налаштування зв'язків для Book
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(b => b.CategoryId);

            modelBuilder.Entity<Book>()
                .HasOne(b => b.Subcategory)
                .WithMany()
                .HasForeignKey(b => b.SubcategoryId);

            modelBuilder.Entity<Subcategory>()
                .HasOne(s => s.Category)
                .WithMany(c => c.Subcategories)
                .HasForeignKey(s => s.CategoryId);

            // Можна додати налаштування для поля Language, якщо потрібна валідація (якщо це потрібно)
            modelBuilder.Entity<Book>()
                .Property(b => b.Language)
                .HasMaxLength(50);  // Встановлюємо максимальну довжину для текстового поля
        }
    }
}
