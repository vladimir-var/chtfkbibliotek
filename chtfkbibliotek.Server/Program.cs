using chtfkbibliotek.Server.Models;
using chtfkbibliotek.Server.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Налаштування CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // Дозволяємо всі джерела, методи та заголовки
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Додавання сервісів для роботи з базою даних та контролерів
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IPdfValidationService, PdfValidationService>();
builder.Services.AddScoped<ISubcategoryService, SubcategoryService>();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Застосування міграцій
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Сталася помилка при застосуванні міграцій.");
    }
}

// Застосування CORS
app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

// Конфігурація обробки HTTP-запитів
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
