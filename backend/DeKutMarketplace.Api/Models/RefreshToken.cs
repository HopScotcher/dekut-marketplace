using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace DeKutMarketplace.Api.Models
{
   public class RefreshToken
    {
        public int Id {get; set;}
        public string Token { get; set;} = string.Empty;
        public string JwtId {get; set;}= string.Empty;
        public DateTime AddedDate {get; set;} = DateTime.UtcNow;
        public DateTime ExpiryDate {get; set;}

        public string UserId {get; set;} = string.Empty;
        public bool IsUsed {get; set;}
        public bool IsRevoked {get; set;}

        [ForeignKey(nameof(UserId))]
        public AppUser? User {get; set;} 
    }
}