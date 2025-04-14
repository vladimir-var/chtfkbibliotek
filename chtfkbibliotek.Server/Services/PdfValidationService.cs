using chtfkbibliotek.Server.Constants;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;

namespace chtfkbibliotek.Server.Services
{
    public interface IPdfValidationService
    {
        Task<byte[]> ValidateAndGetContentAsync(IFormFile file);
    }

    public class PdfValidationService : IPdfValidationService
    {
        public async Task<byte[]> ValidateAndGetContentAsync(IFormFile file)
        {
            if (file == null)
                throw new ArgumentNullException(nameof(file));

            // Проверка размера
            if (file.Length > BookConstants.MaxFileSize)
                throw new ArgumentException($"Файл слишком большой. Максимальный размер - {BookConstants.MaxFileSize / 1024 / 1024}MB");

            // Проверка расширения
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != BookConstants.AllowedFileExtension)
                throw new ArgumentException($"Поддерживаются только {BookConstants.AllowedFileExtension.ToUpper()} файлы");

            // Проверка сигнатуры PDF
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var content = ms.ToArray();
            
            if (content.Length < BookConstants.PdfSignature.Length || 
                !System.Text.Encoding.ASCII.GetString(content, 0, BookConstants.PdfSignature.Length)
                    .Equals(BookConstants.PdfSignature))
            {
                throw new ArgumentException("Файл не является корректным PDF документом");
            }

            return content;
        }
    }
} 