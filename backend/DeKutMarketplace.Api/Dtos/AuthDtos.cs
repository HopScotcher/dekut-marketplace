using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Attributes;
using DeKutMarketplace.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Identity.Client;
using Org.BouncyCastle.Bcpg.OpenPgp;

namespace DeKutMarketplace.Api.Dtos
{
    public class RegisterDto
    {
        [Required]
        public string Email {get; set;} = string.Empty;
        [Required]
        public string Password {get; set;} = string.Empty;
        
        [Required]
        [Phone]
        [KenyanPhoneNumber]
        public string PhoneNumber {get; set;} = string.Empty;
        public string UserName {get; set;} = string.Empty;

        public string? ProfileImage {get; set;}

        public string? Location {get; set;} = string.Empty;
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "Password must be atleast 8 characters long")]
        public string Password {get; set;} = string.Empty;
    }

    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Token {get; set;} = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "New password must have 8 characters or longer")]
        public string NewPassword {get; set;} = string.Empty;
    }

     public class TokenResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt {get; set;}

    }


    public class AuthResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt {get; set;}
        public UserDto User {get; set;} = null!;
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        
        public string? PhoneNumber { get; set; }
        public string? Location { get; set; }
        public string? Image { get; set; }
        public bool Verified {get; set;}
        public DateTime CreatedAt {get; set;}

    }


     public class RefreshTokenRequestDto
    {
        [Required]
        public string AccessToken {get;set;}= string.Empty;
        [Required]
        public string RefreshToken {get; set;} = string.Empty;
    }
 

    
}