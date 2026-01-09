import { Search } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import type { GlossaryCategory } from '../../data/glossary'

interface GlossarySearchAndFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: GlossaryCategory | 'Alle'
  onCategoryChange: (category: GlossaryCategory | 'Alle') => void
  categories: GlossaryCategory[]
  resultsCount: number
}

function CategoryButtons({
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  categories: GlossaryCategory[]
  selectedCategory: GlossaryCategory | 'Alle'
  onCategoryChange: (category: GlossaryCategory | 'Alle') => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === 'Alle' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('Alle')}
      >
        Alle
      </Button>
      {categories.map(category => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}

export function GlossarySearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  resultsCount,
}: GlossarySearchAndFilterProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Begriffe durchsuchen..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Glossar durchsuchen"
          />
        </div>

        {/* Category Filter */}
        <CategoryButtons
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {resultsCount} {resultsCount === 1 ? 'Begriff' : 'Begriffe'} gefunden
        </div>
      </CardContent>
    </Card>
  )
}
