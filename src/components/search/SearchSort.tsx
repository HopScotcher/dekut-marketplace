'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useSearchStore } from '@/stores/searchStore'
import Select from 'react-select'

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant', direction: 'desc' as const },
  { value: 'price', label: 'Price: Low to High', direction: 'asc' as const },
  { value: 'price', label: 'Price: High to Low', direction: 'desc' as const },
  { value: 'date', label: 'Newest First', direction: 'desc' as const },
  { value: 'date', label: 'Oldest First', direction: 'asc' as const },
  { value: 'popularity', label: 'Most Popular', direction: 'desc' as const }
]

export default function SearchSort() {
  const { sortBy, setSortBy, totalResults } = useSearchStore()
  
  type SortOption = {
    value: 'relevance' | 'price' | 'date' | 'popularity'
    label: string
    direction: 'asc' | 'desc'
  }

  const handleSortChange = (
    option: typeof sortOptions[number] | null
  ) => {
    if (option) {
      setSortBy({
        value: option.value as SortOption['value'],
        label: option.label,
        direction: option.direction as SortOption['direction']
      })
    }
  }
  
  const currentSortOption = sortOptions.find(
    option => option.value === sortBy.value && option.direction === sortBy.direction
  )
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {totalResults} {totalResults === 1 ? 'result' : 'results'}
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Sort by:</span>
        <div className="min-w-[200px]">
          <Select
            value={currentSortOption}
            onChange={handleSortChange}
            options={sortOptions}
            isSearchable={false}
            className="text-sm"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div>
      </div>
    </div>
  )
}