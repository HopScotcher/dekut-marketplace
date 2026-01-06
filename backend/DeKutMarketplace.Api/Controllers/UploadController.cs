using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Constraints;

namespace DeKutMarketplace.Api.Controllers
{
    public class UploadController : ControllerBase
    {
        private readonly ILogger<UploadController> _logger;

        public UploadController(ILogger<UploadController> logger)
        {
            _logger = logger;
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

            var fileExtension = Path.GetExtension(file.FileName);
            // create unique file names to prevent bugs
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using(var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            _logger.LogInformation("File uploaded successfully : {FileName}", uniqueFileName);


            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";

            return Ok(new
            {
                message = "File Uploaded successfully",
                fileName = uniqueFileName,
                url = fileUrl            });
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

                var fileExtension = Path.GetExtension(file.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using(var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";

                uploadedFiles.Add(new
                {
                    fileName = uniqueFileName,
                    url = fileUrl
                });
            }

            _logger.LogInformation("Uploaded {count} files successfully", uploadedFiles.Count); 

            return Ok(new
            {
                message = "Files uploaded successfully",
                files = uploadedFiles
            });
        }
    }
}