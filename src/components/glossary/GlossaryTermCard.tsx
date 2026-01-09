import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import type { GlossaryTerm } from '../../data/glossary'

interface GlossaryTermCardProps {
  term: GlossaryTerm
  index: number
  filteredTerms: GlossaryTerm[]
}

function RelatedTermsSection({ term, filteredTerms }: { term: GlossaryTerm; filteredTerms: GlossaryTerm[] }) {
  if (!term.relatedTerms || term.relatedTerms.length === 0) {
    return null
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">Verwandte Begriffe:</p>
      <div className="flex flex-wrap gap-2">
        {term.relatedTerms.map(relatedKey => {
          const relatedTerm = filteredTerms.find(t => t.term.toLowerCase() === relatedKey.toLowerCase())
          return (
            <Button
              key={relatedKey}
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById(`term-${relatedKey}`)
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className="text-xs"
            >
              {relatedTerm?.term || relatedKey}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function GlossaryTermCard({ term, index, filteredTerms }: GlossaryTermCardProps) {
  return (
    <Card key={`${term.term}-${index}`} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl text-blue-900">{term.term}</CardTitle>
            <div className="mt-1">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {term.category}
              </span>
            </div>
          </div>
        </div>
        <CardDescription className="text-base font-medium mt-2">{term.shortDefinition}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed mb-4">{term.detailedExplanation}</p>

        {term.example && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
            <p className="text-sm">
              <span className="font-semibold text-blue-800">Beispiel:</span>{' '}
              <span className="text-gray-700">{term.example}</span>
            </p>
          </div>
        )}

        <RelatedTermsSection term={term} filteredTerms={filteredTerms} />
      </CardContent>
    </Card>
  )
}
