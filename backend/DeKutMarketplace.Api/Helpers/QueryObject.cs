using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Models.Enums;

namespace DeKutMarketplace.Api.Helpers
{
    public class QueryObject
    {
        public string? Name {get; set;}
        public decimal? MinPrice {get; set;}
        public decimal? MaxPrice {get; set;}
        public bool Negotiable {get; set;} = true;

        public string? SortBy {get;set;}
        public bool IsDescending {get; set;} = false;
        // default to all product conditions
        public ProductCondition? Condition {get; set;} 

        // defaults to all locations
        public string? Location {get; set;} 
        public string? SellerId {get; set;}
        public string? CategoryId {get; set;}

        // pagination
        public int PageNumber {get; set;} = 1;
        public int PageSize { get; set; } = 20;
    }
}