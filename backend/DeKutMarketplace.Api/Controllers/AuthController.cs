using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Data;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Interfaces;
using DeKutMarketplace.Api.Models;
using DeKutMarketplace.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Server.HttpSys;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DeKutMarketplace.Api.Controllers
{
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _config;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IEmailService _emailService;

        private readonly ILogger<AuthController> _logger;
        public AuthController(AppDbContext dbcontext, UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration config, ILogger<AuthController> logger, IEmailService emailService )
        {
            _dbContext = dbcontext;
            _signInManager = signInManager;
            _userManager = userManager;
            _config = config;
            _logger = logger;
            _emailService = emailService;
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
            
            _logger.LogInformation("User {email} registered and signed in successfully", newUser.Email);


            var authResponse = await GenerateAuthResponse(newUser, "Registration successful");

            return Ok(authResponse);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
             var user = await _userManager.FindByEmailAsync(loginDto.Email);

             if(user == null)
            {
                BadRequest("Email or password is incorrect");
            }

            var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: true);

            if (passwordCheck.Succeeded)
            {


            var authResponse = await GenerateAuthResponse(user, "Login successful");

            return Ok(authResponse);
            }

            if (passwordCheck.IsLockedOut)
            {
                _logger.LogWarning("User account {Email} locked out", user.Email);
                return StatusCode(StatusCodes.Status403Forbidden, "Tjis account has been locked, try again later");
            }

            return Unauthorized("Incorrect email or password");

        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);

            if(user == null)
            {
                _logger.LogInformation("password reset request for non-existent user {Email}", forgotPasswordDto.Email);
                return Ok(new {message ="If an account with this email exists, we have sent a password reset link to your email"});
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = System.Net.WebUtility.UrlEncode(token);
            var frontendUrl = _config["FrontEndUrl"];

            var resetLink = $"{frontendUrl}/reset-password?email={user.Email}&code={encodedToken}";
            var emailBody = $"Reset your password by <a href='{resetLink}'>clicking here</a>";

            await  _emailService.SendByEmailAsync(user.Email, "Reset your password", emailBody);

            _logger.LogInformation("password reset link sent to {Email}", user.Email);
            return Ok(new {message = "if this account exists, you'll receive a link to reset your password"});
        }


        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);

            if(user == null)
            {
                BadRequest("password request failed");
            }

            var decodedToken = System.Net.WebUtility.UrlDecode(resetPasswordDto.Token);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, resetPasswordDto.NewPassword);

            if (result.Succeeded)
            {
                _logger.LogInformation("password reset successfully for user {Email}", resetPasswordDto.Email);
                return Ok(new {message = "password reset was successful. You can now login with into your account"});

            }

            foreach(var error in result.Errors)
            {
                _logger.LogWarning("password reset failed for {Email}: {Error}", resetPasswordDto.Email, error);
            }

            return BadRequest("password reset failed");
        }


        private string GenerateJwtToken(AppUser user, string jwtId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, jwtId)
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


        private async Task<RefreshToken> GenerateRefreshToken(AppUser user, string jwtId)
        {
            var refreshToken = new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                JwtId = jwtId,
                UserId = user.Id,
                AddedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddDays(30),
                IsUsed = false,
                IsRevoked = false
            };
        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync();

        return refreshToken;
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!);
            // JwtSecurityToken? jwtToken;
            ClaimsPrincipal? principal;

            try
            {
                principal = tokenHandler.ValidateToken(request.AccessToken, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = false,
                    ValidIssuer = _config["JwtSettings:Issuer"],
                    ValidAudience = _config["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out SecurityToken validatedToken);
                // jwtToken = tokenHandler.ReadJwtToken(request.AccessToken);
            }
            catch(Exception ex)
            {
                _logger.LogWarning("Invalid access token provided: {Error}", ex.Message);
                return BadRequest(new {message = "invalid access token format"});
            }

            var jti = principal.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;

            if (string.IsNullOrEmpty(jti))
            {
                return BadRequest(new {message = "Invalid token: missing JTI claim"});
            }


            var storedRefreshToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && rt.JwtId == jti);

            if(storedRefreshToken == null)
            {
                return BadRequest(new {message = "refresh token not found"});
            }

            if (storedRefreshToken.IsUsed)
            {
                var usedUser = await _userManager.FindByIdAsync(storedRefreshToken.UserId);

                _logger.LogWarning("Attempted use of used token for user {Email}", storedRefreshToken.UserId);  
                await RevokeAllUserTokens(storedRefreshToken.UserId);
                return BadRequest( new {message = "Refresh token already use. All sessions revoked"});
            }

            if (storedRefreshToken.IsRevoked)
            {
                return BadRequest( new {message = "refresh token has been revoked"});
            }

            if(storedRefreshToken.ExpiryDate < DateTime.UtcNow)
            {
                return BadRequest(new {message = "refresh token has expired.Please login again"});
            }

            storedRefreshToken.IsUsed = true;
            await _dbContext.SaveChangesAsync();

            var user = await _userManager.FindByIdAsync(storedRefreshToken.UserId);
            if(user == null)
            {
                return BadRequest("User not found");
            }

            var authResponse = await GenerateAuthResponse(user, "Tokens refreshed successfully");

            return Ok(authResponse);
        }
        
        private async Task RevokeAllUserTokens(string userId)
        {
            var userTokens = await _dbContext.RefreshTokens.Where(rt => rt.UserId == userId && !rt.IsRevoked).ToListAsync();

            foreach(var token in userTokens)
            {
                token.IsRevoked = true;
            }

            await _dbContext.SaveChangesAsync();
            _logger.LogWarning("All tokens revoked for user {UserId} due to security measures", userId);
        }

        private async Task<AuthResponseDto> GenerateAuthResponse(AppUser user, string message)
        {
            var jwtId = Guid.NewGuid().ToString();
            var accessToken = GenerateJwtToken(user, jwtId);
            var refreshToken = await GenerateRefreshToken(user, jwtId);

            return new AuthResponseDto
            {
                Message = message,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_config["JwtSettings:ExpiryMinutes"])),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email!,
                        Name = user.Name,
                        PhoneNumber = user.PhoneNumber,
                        Location = user.Location,
                        Image = user.Image,
                        Verified = user.Verified,
                        CreatedAt = user.CreatedAt
                    }
            };
        }
        
    }
}