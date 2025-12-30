using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace DeKutMarketplace.Api.Services
{
    public class EmailService : IEmailService
    {

        private readonly ILogger<EmailService> _logger;
        public EmailService(ILogger<EmailService> logger)
        {
            _logger= logger;
        }
        public Task SendByEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation("MOCK EMAIL");
            _logger.LogInformation("To: {To}", to);
            _logger.LogInformation("Subject: {subject}", subject);
            _logger.LogInformation("Body: {Body}", body);

            return Task.CompletedTask;
        }
    }
}