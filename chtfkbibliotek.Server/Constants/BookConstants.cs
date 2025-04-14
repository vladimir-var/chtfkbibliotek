namespace chtfkbibliotek.Server.Constants
{
    public static class BookConstants
    {
        public const int MaxFileSize = 50 * 1024 * 1024; // 50MB
        public const string AllowedFileExtension = ".pdf";
        public const string PdfSignature = "%PDF-";
        public const string PdfContentType = "application/pdf";
    }
} 