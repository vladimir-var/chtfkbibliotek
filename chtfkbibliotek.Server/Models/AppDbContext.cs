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
        public DbSet<Genre> Genres { get; set; }
        public DbSet<BookGenre> BookGenres { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Видаляємо наявне налаштування для Enum
            // modelBuilder.HasPostgresEnum<LanguageType>("language_type");  // Видалити

            // Налаштування зв'язків для BookGenre
            modelBuilder.Entity<BookGenre>()
                .HasKey(bg => new { bg.BookId, bg.GenreId });

            modelBuilder.Entity<BookGenre>()
                .HasOne(bg => bg.Book)
                .WithMany(b => b.BookGenres)
                .HasForeignKey(bg => bg.BookId);

            modelBuilder.Entity<BookGenre>()
                .HasOne(bg => bg.Genre)
                .WithMany()
                .HasForeignKey(bg => bg.GenreId);

            // Можна додати налаштування для поля Language, якщо потрібна валідація (якщо це потрібно)
            modelBuilder.Entity<Book>()
                .Property(b => b.Language)
                .HasMaxLength(50);  // Встановлюємо максимальну довжину для текстового поля
        }
    }
}
