using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Interfaces;
using Org.BouncyCastle.Ocsp;

namespace DeKutMarketplace.Api.Services
{
    public class LocalStorageService : IStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<LocalStorageService> _logger;
        public LocalStorageService(IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor, ILogger<LocalStorageService> logger)
        {
            _logger = logger;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;   
        }
        public async Task<string> UploadFileAsync(IFormFile file, string? folder = null)
        {
            if(file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null");
            }

            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");

            if(!string.IsNullOrEmpty(folder))
            {
                uploadsPath = Path.Combine(uploadsPath, folder);
            }

            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var filePath = Path.Combine(uploadsPath, uniqueFileName);


            using(var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = _httpContextAccessor.HttpContext?.Request;
            var baseUrl = $"{request?.Scheme}://{request?.Host}";

            var relativePath = !string.IsNullOrEmpty(folder)
            ? $"/uploads/{folder}/{uniqueFileName}" : $"/uploads/{uniqueFileName}";

            var fileUrl = $"{baseUrl}{relativePath}";

            _logger.LogInformation("File uploaded to local storage: {FileName}", uniqueFileName);


            return fileUrl;
            
        }

        public async Task<List<string>> UploadFilesAsync(List<IFormFile> files, string? folder = null)
        {
            var urls = new List<string>();

            foreach(var file in files)
            {
                var url = await UploadFileAsync(file, folder);
                urls.Add(url);
            }

            return urls;
        }


        public Task<bool> DeleteFileAsync(string fileIdentifier)
        {
            try
            {
                var fileName = fileIdentifier.Contains("/") ? Path.GetFileName(fileIdentifier) : fileIdentifier;

                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
                var filePath = Directory.GetFiles(uploadsPath, fileName, SearchOption.AllDirectories).FirstOrDefault();

                if(filePath != null && File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("file deleted from local storage: {FileName}", fileName);

                    return Task.FromResult(true);
                }

                _logger.LogWarning("File not found for deletion: {FileName}", fileName);

                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FileIdentifier}", fileIdentifier);
                return Task.FromResult(false);
            }
        }

        public Task<string> GetFileUrlAsync(string fileName)
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            var baseUrl = $"{request?.Scheme}://{request?.Host}";
            var fileUrl = $"{baseUrl}/uploads/{fileName}";

            return Task.FromResult(fileUrl);
        }

    }
}