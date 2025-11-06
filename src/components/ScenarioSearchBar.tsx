import { Input } from './ui/input'
import { Search, X } from 'lucide-react'

interface ScenarioSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
}

/**
 * Search bar component for filtering scenarios
 */
export function ScenarioSearchBar({ searchQuery, onSearchChange, onClearSearch }: ScenarioSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Szenarien durchsuchen..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
