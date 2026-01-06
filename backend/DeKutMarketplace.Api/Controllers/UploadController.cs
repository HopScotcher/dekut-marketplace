using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Constraints;

namespace DeKutMarketplace.Api.Controllers
{
    public class UploadController : ControllerBase
    {
        private readonly ILogger<UploadController> _logger;
        private readonly IStorageService _storageService;

        public UploadController(ILogger<UploadController> logger, IStorageService storageService)
        {
            _logger = logger;
            _storageService = storageService;
        }

        [HttpPost("single")]
        public async Task<IActionResult> UploadSingleImage(IFormFile file)
        {
            if(file == null || file.Length == 0)
            {
                return BadRequest(new {message = "No file was uploaded"});
            }

            var allowedTypes = new[] {"image/jpeg", "image/jpg", "image/png", "image/webp"};

            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(new {message = "Only JPEG, PNG or WEBP image formats are allowed"});
            }

            const long maxFileSize = 5 *1024 *1024;
            
            if(file.Length > maxFileSize)
            {
                return BadRequest(new {message = "File size cannot exceed 5MB"});
            }

            try
            {
                var fileUrl = await _storageService.UploadFileAsync(file, "products");

                return Ok(new
                {
                    message = "File uploaded successfully",
                    url = fileUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file: {ErrorMessage}", ex.Message);
                return StatusCode(500, new{message = "An error occured while uploading the file"});
            }

             
        }


        [HttpPost("multiple")]
        public async Task<IActionResult> UploadMultipleImages(List<IFormFile> files)
        {
            if(files == null || files.Count == 0)
            {
                return BadRequest(new {message = "No files were uploaded"});
            }

            if(files.Count > 5)
            {
                return BadRequest(new {message = "You have exceeded maximum upload limit of 5 images"});
            }

            var uploadedFiles = new List<object>();
            var allowedTypes = new[]{"image/jpg", "image/jpeg", "image/webp", "image/png"};

            const long maxFileSize = 5 * 1024 * 1024;

            foreach(var file in files)
            {
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new {message = "Image format not allowed. Use JPEG, PNG, JPG or WEBP"});

                }

                if(file.Length > maxFileSize)
                {
                    return BadRequest(new {message = $"File {file.FileName} exceeds the 5MB file limit size"});
                }

                try
                {
                    var urls = await _storageService.UploadFilesAsync(files, "products");

                    return Ok(new
                    {
                        message = "Files uploaded successfully",
                        urls = urls
                    });
                }catch(Exception ex)
                {
                    _logger.LogError(ex, "Error uploading files: {ErrorMessage}", ex.Message);
                    return StatusCode(500, new {message = " An error occurred while uploading the files"});
                }
            }

            _logger.LogInformation("Uploaded {count} files successfully", uploadedFiles.Count); 

            return Ok(new
            {
                message = "Files uploaded successfully",
                files = uploadedFiles
            });
        }


        [HttpDelete]
        public async Task<IActionResult> DeleteFile([FromQuery] string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
            {
                return BadRequest(new {message = " File URL is required"});
            }

            try
            {
                var result = await _storageService.DeleteFileAsync(fileUrl);

                if (result)
                {
                    return Ok(new {message = "File deleted successfully"});
                }

                return NotFound(new {message = "File not found"});
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file");
                return StatusCode(500, new {message = "An error occurred while deleting the file"});
                
            }
        }
    }
}