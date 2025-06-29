'use client'

import { useState } from 'react'
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSearchStore } from '@/stores/searchStore'
import Select from 'react-select'
import ReactSlider from 'react-slider'
import clsx from 'clsx'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'books', label: 'Books' },
  { value: 'toys', label: 'Toys & Games' }
]

const conditions = [
  { value: '', label: 'Any Condition' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
]

export default function SearchFilters() {
  const { filters, setFilters, clearFilters } = useSearchStore()
  const [isOpen, setIsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice])
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
    setFilters({
      minPrice: values[0],
      maxPrice: values[1]
    })
  }
  
  const handleCategoryChange = (option: any) => {
    setFilters({ category: option?.value || '' })
  }
  
  const handleConditionChange = (option: any) => {
    setFilters({ condition: option?.value || '' })
  }
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ location: e.target.value })
  }
  
  const hasActiveFilters = Boolean(
    filters.category || 
    filters.condition || 
    filters.location ||
    filters.minPrice > 0 ||
    filters.maxPrice < 10000
  )
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <ChevronDownIcon 
            className={clsx(
              "h-5 w-5 transition-transform",
              isOpen && "rotate-180"
            )} 
          />
        </button>
      </div>
      
      {/* Filter content */}
      <div className={clsx(
        "space-y-4",
        "lg:block", // Always visible on desktop
        isOpen ? "block" : "hidden" // Toggle on mobile
      )}>
        {/* Clear filters */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>
        )}
        
        {/* Category filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select
            value={categories.find(cat => cat.value === filters.category)}
            onChange={handleCategoryChange}
            options={categories}
            isClearable
            placeholder="Select category..."
            className="text-sm"
            classNamePrefix="react-select"
          />
        </div>
        
        {/* Price range filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <div className="px-2">
            <ReactSlider
              value={priceRange}
              onChange={handlePriceChange}
              min={0}
              max={10000}
              step={50}
              className="horizontal-slider"
              thumbClassName="slider-thumb"
              trackClassName="slider-track"
              renderThumb={(props, state) => (
                <div {...props} className="slider-thumb">
                  <span className="slider-thumb-label">${state.valueNow}</span>
                </div>
              )}
            />
          </div>
        </div>
        
        {/* Condition filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <Select
            value={conditions.find(cond => cond.value === filters.condition)}
            onChange={handleConditionChange}
            options={conditions}
            isClearable
            placeholder="Select condition..."
            className="text-sm"
            classNamePrefix="react-select"
          />
        </div>
        
        {/* Location filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={handleLocationChange}
            placeholder="Enter city or area..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </div>
  )
}