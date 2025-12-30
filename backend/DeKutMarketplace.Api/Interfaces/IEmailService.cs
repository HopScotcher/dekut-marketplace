using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DeKutMarketplace.Api.Interfaces
{
    public interface IEmailService
    {
        Task  SendByEmailAsync(string to, string subject, string body);
    }
}