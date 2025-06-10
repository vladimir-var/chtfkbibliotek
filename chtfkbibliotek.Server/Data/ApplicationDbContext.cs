using chtfkbibliotek.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace chtfkbibliotek.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Subcategory> Subcategories { get; set; }
        public DbSet<Book> Books { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Налаштування категорій
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("categories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description);
            });

            // Налаштування підкатегорій
            modelBuilder.Entity<Subcategory>(entity =>
            {
                entity.ToTable("subcategories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description);
                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Subcategories)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Налаштування книг
            modelBuilder.Entity<Book>(entity =>
            {
                entity.ToTable("books");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Author).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description);
                entity.Property(e => e.Publisher).HasMaxLength(200);
                entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
                entity.Property(e => e.FileUrl).HasMaxLength(500);

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Books)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Subcategory)
                    .WithMany(s => s.Books)
                    .HasForeignKey(e => e.SubcategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
} 