using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DeKutMarketplace.Api.Interfaces
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string? folder = null);
        Task<List<string>> UploadFilesAsync(List<IFormFile> files, string? folder = null);
        Task<bool> DeleteFileAsync(string fileIdentifier);
        Task<string> GetFileUrlAsync(string fileName);
    }
}