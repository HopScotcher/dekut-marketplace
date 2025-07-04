/* eslint-disable @typescript-eslint/no-unused-vars */
import { Product } from '@/lib/types'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface SearchFilters {
  category: string
  minPrice: number
  maxPrice: number
  condition: string
  location: string
}

export interface SortOption {
  value: string
  label: string
  direction: 'asc' | 'desc'
}

interface SearchState {
  // Search state
  searchQuery: string
  filters: SearchFilters
  sortBy: SortOption
  isLoading: boolean
  
  // Results state
  searchResults: Product[]
  totalResults: number
  currentPage: number
  
  // Actions
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  setSortBy: (sort: SortOption) => void
  setSearchResults: (results: Product[], total: number) => void
  setCurrentPage: (page: number) => void
  setLoading: (loading: boolean) => void
  clearFilters: () => void
  resetSearch: () => void
}

const defaultFilters: SearchFilters = {
  category: '',
  minPrice: 0,
  maxPrice: 10000,
  condition: '',
  location: ''
}

const defaultSort: SortOption = {
  value: 'relevance',
  label: 'Most Relevant',
  direction: 'desc'
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        searchQuery: '',
        filters: defaultFilters,
        sortBy: defaultSort,
        isLoading: false,
        searchResults: [],
        totalResults: 0,
        currentPage: 1,

        // Actions
        setSearchQuery: (query) => 
          set({ searchQuery: query }, false, 'setSearchQuery'),
          
        setFilters: (newFilters) =>
          set(
            (state) => ({ 
              filters: { ...state.filters, ...newFilters },
              currentPage: 1 // Reset to first page when filters change
            }),
            false,
            'setFilters'
          ),
          
        setSortBy: (sort) =>
          set({ sortBy: sort, currentPage: 1 }, false, 'setSortBy'),
          
        setSearchResults: (results, total) =>
          set({ 
            searchResults: results, 
            totalResults: total,
            isLoading: false 
          }, false, 'setSearchResults'),
          
        setCurrentPage: (page) =>
          set({ currentPage: page }, false, 'setCurrentPage'),
          
        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),
          
        clearFilters: () =>
          set({ 
            filters: defaultFilters,
            currentPage: 1 
          }, false, 'clearFilters'),
          
        resetSearch: () =>
          set({
            searchQuery: '',
            filters: defaultFilters,
            sortBy: defaultSort,
            searchResults: [],
            totalResults: 0,
            currentPage: 1,
            isLoading: false
          }, false, 'resetSearch')
      }),
      {
        name: 'search-store',
        partialize: (state) => ({ 
          filters: state.filters,
          sortBy: state.sortBy 
        })
      }
    )
  )
)