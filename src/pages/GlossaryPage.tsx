import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { GlossaryHeader } from '../components/glossary/GlossaryHeader'
import { GlossarySearchAndFilter } from '../components/glossary/GlossarySearchAndFilter'
import { GlossaryTermCard } from '../components/glossary/GlossaryTermCard'
import {
  getSortedGlossaryTerms,
  getGlossaryTermsByCategory,
  getGlossaryCategories,
  searchGlossaryTerms,
  type GlossaryTerm,
  type GlossaryCategory,
} from '../data/glossary'

/**
 * GlossaryPage - Interactive financial glossary with search and category filtering
 *
 * Features:
 * - Alphabetically sorted German financial terms
 * - Search functionality across term names and definitions
 * - Category filtering (Steuern, Investitionen, Rente, Versicherungen, Allgemein)
 * - Detailed explanations with examples
 * - Related terms navigation
 */
export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'Alle'>('Alle')

  const categories = useMemo(() => getGlossaryCategories(), [])

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    let terms: GlossaryTerm[]

    // Apply search filter
    if (searchQuery.trim()) {
      terms = searchGlossaryTerms(searchQuery)
    } else if (selectedCategory === 'Alle') {
      terms = getSortedGlossaryTerms()
    } else {
      terms = getGlossaryTermsByCategory(selectedCategory)
    }

    return terms
  }, [searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      <GlossaryHeader />

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <GlossarySearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          resultsCount={filteredTerms.length}
        />

        {/* Terms List */}
        {filteredTerms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                Keine Begriffe gefunden. Versuchen Sie eine andere Suche oder Kategorie.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTerms.map((term, index) => (
              <GlossaryTermCard key={`${term.term}-${index}`} term={term} index={index} filteredTerms={filteredTerms} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
