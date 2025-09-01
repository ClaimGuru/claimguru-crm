import React, { useState, useRef, useEffect } from 'react'
import { Search, Filter, X, Clock, Star, Bookmark, SortAsc, SortDesc } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'
import { Badge } from './Badge'

interface SearchFilter {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  options?: { label: string; value: string }[]
  value?: any
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilter[]
  createdAt: Date
}

interface AdvancedSearchProps {
  placeholder?: string
  onSearch: (query: string, filters: SearchFilter[]) => void
  onSort?: (field: string, direction: 'asc' | 'desc') => void
  filters?: SearchFilter[]
  sortOptions?: { label: string; value: string }[]
  className?: string
  enableSavedSearches?: boolean
}

export function AdvancedSearch({ 
  placeholder = 'Search...',
  onSearch,
  onSort,
  filters = [],
  sortOptions = [],
  className = '',
  enableSavedSearches = true
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>(filters)
  const [showFilters, setShowFilters] = useState(false)
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Load saved searches from localStorage
  useEffect(() => {
    if (enableSavedSearches) {
      const saved = localStorage.getItem('claimguru-saved-searches')
      if (saved) {
        setSavedSearches(JSON.parse(saved))
      }
    }
  }, [enableSavedSearches])
  
  // Save to localStorage when savedSearches changes
  useEffect(() => {
    if (enableSavedSearches) {
      localStorage.setItem('claimguru-saved-searches', JSON.stringify(savedSearches))
    }
  }, [savedSearches, enableSavedSearches])
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowFilters(false)
        setShowSavedSearches(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSearch = () => {
    onSearch(query, activeFilters)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  
  const updateFilter = (key: string, value: any) => {
    setActiveFilters(prev => 
      prev.map(filter => 
        filter.key === key ? { ...filter, value } : filter
      )
    )
  }
  
  const removeFilter = (key: string) => {
    setActiveFilters(prev => 
      prev.map(filter => 
        filter.key === key ? { ...filter, value: undefined } : filter
      )
    )
  }
  
  const clearAllFilters = () => {
    setActiveFilters(prev => 
      prev.map(filter => ({ ...filter, value: undefined }))
    )
    setQuery('')
  }
  
  const saveCurrentSearch = () => {
    if (!query && !activeFilters.some(f => f.value)) return
    
    const name = prompt('Enter a name for this search:')
    if (!name) return
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters: activeFilters.filter(f => f.value),
      createdAt: new Date()
    }
    
    setSavedSearches(prev => [newSearch, ...prev.slice(0, 9)]) // Keep only 10 most recent
  }
  
  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query)
    setActiveFilters(prev => 
      prev.map(filter => {
        const savedFilter = savedSearch.filters.find(f => f.key === filter.key)
        return savedFilter ? { ...filter, value: savedFilter.value } : { ...filter, value: undefined }
      })
    )
    setShowSavedSearches(false)
    onSearch(savedSearch.query, savedSearch.filters)
  }
  
  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id))
  }
  
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(newDirection)
    onSort?.(field, newDirection)
  }
  
  const activeFilterCount = activeFilters.filter(f => f.value).length
  
  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Main search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-20"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {enableSavedSearches && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="p-1"
              title="Saved searches"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="p-1 relative"
            title="Filters"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters
            .filter(filter => filter.value)
            .map(filter => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.label}: {filter.value}
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          }
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-6"
          >
            Clear all
          </Button>
        </div>
      )}
      
      {/* Filters dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <div className="flex items-center space-x-2">
                {enableSavedSearches && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveCurrentSearch}
                    disabled={!query && !activeFilters.some(f => f.value)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeFilters.map(filter => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {filter.label}
                  </label>
                  {filter.type === 'select' ? (
                    <Select
                      value={filter.value || ''}
                      onValueChange={(value) => updateFilter(filter.key, value)}
                    >
                      <option value="">All</option>
                      {filter.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      type={filter.type}
                      value={filter.value || ''}
                      onChange={(e) => updateFilter(filter.key, e.target.value)}
                      placeholder={`Filter by ${filter.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Sort options */}
            {sortOptions.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Sort by</h4>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSort(option.value)}
                      className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                        sortField === option.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                      {sortField === option.value && (
                        sortDirection === 'asc' ? 
                          <SortAsc className="h-3 w-3 ml-1" /> : 
                          <SortDesc className="h-3 w-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
              <Button
                onClick={() => {
                  handleSearch()
                  setShowFilters(false)
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Saved searches dropdown */}
      {showSavedSearches && enableSavedSearches && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900">Saved Searches</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSavedSearches(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {savedSearches.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved searches yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedSearches.map(savedSearch => (
                <div
                  key={savedSearch.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                >
                  <button
                    onClick={() => loadSavedSearch(savedSearch)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-gray-900">{savedSearch.name}</div>
                    <div className="text-sm text-gray-500">
                      {savedSearch.query && `"${savedSearch.query}"`}
                      {savedSearch.filters.length > 0 && 
                        ` • ${savedSearch.filters.length} filter${savedSearch.filters.length !== 1 ? 's' : ''}`
                      }
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {savedSearch.createdAt.toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteSavedSearch(savedSearch.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch