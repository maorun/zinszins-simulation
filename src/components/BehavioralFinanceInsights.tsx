import { useState } from 'react'
import { Brain, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { CollapsibleCard, CollapsibleCardHeader, CollapsibleCardContent } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import {
  behavioralBiases,
  getAllCategories,
  getBiasesByCategory,
  searchBiases,
  type BehavioralBias,
} from '../data/behavioral-finance'

/**
 * Get color classes for bias category badge
 */
function getCategoryColor(category: string): string {
  switch (category) {
    case 'Emotional':
      return 'bg-red-100 text-red-800'
    case 'Cognitive':
      return 'bg-blue-100 text-blue-800'
    case 'Social':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Category Overview Component
 */
function CategoryOverview() {
  return (
    <div className="flex gap-2 flex-wrap">
      {getAllCategories().map(category => {
        const count = getBiasesByCategory(category).length
        return (
          <span key={category} className={`text-xs px-3 py-1.5 rounded-full border ${getCategoryColor(category)}`}>
            {category === 'Emotional' && '❤️ Emotional'}
            {category === 'Cognitive' && '🧠 Kognitive Fehler'}
            {category === 'Social' && '👥 Soziale Einflüsse'}
            <span className="ml-1">({count})</span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * Single Bias Card Component
 */
interface BiasCardProps {
  bias: BehavioralBias
  biasKey: string
  isOpen: boolean
  onToggle: () => void
}

function BiasCard({ bias, biasKey, isOpen, onToggle }: BiasCardProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="border-l-4 border-l-purple-500">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{bias.name}</CardTitle>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(bias.category)}`}>
                    {bias.category}
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm">{bias.shortDescription}</CardDescription>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <BiasCardContent bias={bias} biasKey={biasKey} />
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

/**
 * Bias Card Content Component
 */
interface BiasCardContentProps {
  bias: BehavioralBias
  biasKey: string
}

function BiasCardContent({ bias, biasKey }: BiasCardContentProps) {
  return (
    <CardContent className="pt-0 space-y-4">
      {/* Detailed Explanation */}
      <div>
        <h4 className="font-semibold text-sm text-gray-900 mb-1">Was ist das?</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{bias.detailedExplanation}</p>
      </div>

      {/* German Example */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
        <h4 className="font-semibold text-sm text-amber-900 mb-1">🇩🇪 Deutsches Beispiel</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{bias.germanExample}</p>
      </div>

      {/* How to Avoid */}
      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
        <h4 className="font-semibold text-sm text-green-900 mb-1">💡 So vermeiden Sie den Fehler</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{bias.howToAvoid}</p>
      </div>

      {/* Related Biases */}
      <RelatedBiases bias={bias} currentBiasKey={biasKey} />
    </CardContent>
  )
}

/**
 * Related Biases Component
 */
interface RelatedBiasesProps {
  bias: BehavioralBias
  currentBiasKey: string
}

function RelatedBiases({ bias }: RelatedBiasesProps) {
  if (!bias.relatedBiases || bias.relatedBiases.length === 0) {
    return null
  }

  return (
    <div>
      <h4 className="font-semibold text-sm text-gray-900 mb-2">Verwandte Biases</h4>
      <div className="flex gap-2 flex-wrap">
        {bias.relatedBiases.map(relatedKey => {
          const relatedBias = behavioralBiases[relatedKey]
          if (!relatedBias) return null
          return (
            <span key={relatedKey} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
              {relatedBias.name.split('(')[0].trim()}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Biases List Component
 */
interface BiasesListProps {
  displayBiases: BehavioralBias[]
  openBiases: Set<string>
  onToggleBias: (biasKey: string) => void
}

function BiasesList({ displayBiases, openBiases, onToggleBias }: BiasesListProps) {
  if (displayBiases.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Keine Ergebnisse gefunden. Versuchen Sie einen anderen Suchbegriff.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayBiases.map(bias => {
        const biasKey = Object.keys(behavioralBiases).find(key => behavioralBiases[key] === bias) || ''
        const isOpen = openBiases.has(biasKey)

        return (
          <BiasCard
            key={biasKey}
            bias={bias}
            biasKey={biasKey}
            isOpen={isOpen}
            onToggle={() => onToggleBias(biasKey)}
          />
        )
      })}
    </div>
  )
}

/**
 * Component Header
 */
function InsightsHeader() {
  return (
    <CollapsibleCardHeader>
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-purple-600" />
        <span>Behavioral Finance - Häufige Anlegerfehler</span>
      </div>
    </CollapsibleCardHeader>
  )
}

/**
 * Component Footer
 */
function InsightsFooter() {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-sm text-gray-700">
        <strong>Tipp:</strong> Das Bewusstsein dieser psychologischen Fallen ist der erste Schritt zur Vermeidung. Eine
        disziplinierte, langfristige Strategie mit regelbasierten Sparplänen hilft, emotionale Entscheidungen zu
        minimieren.
      </p>
    </div>
  )
}

/**
 * BehavioralFinanceInsights - Educational component about common investor psychological errors
 *
 * Provides information about behavioral finance biases with German examples
 * to help users avoid common investing mistakes.
 */
export function BehavioralFinanceInsights() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openBiases, setOpenBiases] = useState<Set<string>>(new Set())

  // Get biases to display based on search
  const displayBiases = searchTerm ? searchBiases(searchTerm) : Object.values(behavioralBiases)

  const toggleBias = (biasKey: string) => {
    setOpenBiases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(biasKey)) {
        newSet.delete(biasKey)
      } else {
        newSet.add(biasKey)
      }
      return newSet
    })
  }

  return (
    <CollapsibleCard defaultOpen={false}>
      <InsightsHeader />

      <CollapsibleCardContent>
        <div className="space-y-4">
          {/* Description */}
          <CardDescription>
            Lernen Sie typische psychologische Fehler kennen, die viele Anleger machen, und wie Sie diese vermeiden
            können.
          </CardDescription>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Suche nach Bias..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Overview */}
          {!searchTerm && <CategoryOverview />}

          {/* Biases List */}
          <BiasesList displayBiases={displayBiases} openBiases={openBiases} onToggleBias={toggleBias} />

          {/* Footer Info */}
          <InsightsFooter />
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
