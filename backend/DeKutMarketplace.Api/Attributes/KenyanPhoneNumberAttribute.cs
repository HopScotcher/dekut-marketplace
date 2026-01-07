using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DeKutMarketplace.Api.Attributes
{
    public class KenyanPhoneNumberAttribute : ValidationAttribute
    {
        private static readonly Regex KenyanPhoneRegex = new Regex(
            @"\+254[17]\d{8}$",
            RegexOptions.Compiled
        );

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if(value == null || string.IsNullOrWhiteSpace(value.ToString()))
            {
                return ValidationResult.Success;
            }

            string phoneNumber = value.ToString()!;

            if (!KenyanPhoneRegex.IsMatch(phoneNumber))
            {
                return new ValidationResult("Phone number must be in Kenyan format: +254712345678 or +254112345678");
            }

            return ValidationResult.Success;
        }
    }
}