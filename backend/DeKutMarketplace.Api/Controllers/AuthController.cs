using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Data;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.IdentityModel.Tokens;

namespace DeKutMarketplace.Api.Controllers
{
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _config;
        private readonly SignInManager<AppUser> _signInManager;

        private readonly ILogger<AuthController> _logger;
        public AuthController(AppDbContext dbcontext, UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration config, ILogger<AuthController> logger )
        {
            _dbContext = dbcontext;
            _signInManager = signInManager;
            _userManager = userManager;
            _config = config;
            _logger = logger;
            
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register( [FromBody] RegisterDto registerDto)
        {
            var user = await  _userManager.FindByEmailAsync(registerDto.Email);

            if(user != null)
            {
                BadRequest("Email is already in use");
            }

            var newUser = new AppUser
            {
                Email = registerDto.Email,
                UserName = registerDto.Email,
                Name = registerDto.UserName,
                PhoneNumber = registerDto.PhoneNumber,
                Image = registerDto.ProfileImage,
                Location  = registerDto.Location,
                EmailConfirmed = true
            };

            var registerResult = await _userManager.CreateAsync(newUser, registerDto.Password);

            if (!registerResult.Succeeded)
            {
                _logger.LogError("Failed to create account for {Email}, Errors: {Errors}", newUser.Email, registerResult.Errors);
                BadRequest(registerResult.Errors);
            }

            await _userManager.AddToRoleAsync(newUser, "User");

            var token = GenerateJwtToken(newUser);

            _logger.LogInformation("User {email} registered and signed in successfully", newUser.Email);

            return Ok(new
            {
                message ="Registration successful",
                token = token,
                user = new
                {
                    id = newUser.Id,
                    email = newUser.Email,
                    name = newUser.Name,
                    location = newUser.Location
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            throw new ArgumentNullException("error occured");
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            throw new ArgumentNullException("error occured");
        }


        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            throw new ArgumentNullException("error occured");
        }


        private string GenerateJwtToken(AppUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(_config["JwtSettings:ExpiryMinutes"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        
    }
}