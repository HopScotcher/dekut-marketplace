'use client'

import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSearchStore } from '@/stores/searchStore'
import { debounce } from 'lodash'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  initialQuery?: string
}

export default function SearchBar({ 
  placeholder = "Search products...",
  onSearch,
  initialQuery = "",
}: SearchBarProps) {
  const { searchQuery, setSearchQuery } = useSearchStore()
  const [localQuery, setLocalQuery] = useState(initialQuery || searchQuery)
  
  // Debounced search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      onSearch?.(query)
    }, 300),
    [setSearchQuery, onSearch]
  )
  
  useEffect(() => {
    if (initialQuery !== undefined ){
      setLocalQuery(initialQuery)
      setSearchQuery(initialQuery)
    }
     
  }, [initialQuery, setSearchQuery])


  useEffect(()=>{
    debouncedSearch(localQuery)
    return ()=> {
      debouncedSearch.cancel()
    }
  }, [localQuery, debouncedSearch])
  
  const handleClear = () => {
    setLocalQuery('')
    setSearchQuery('')
    onSearch?.('')
  }
  
  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}