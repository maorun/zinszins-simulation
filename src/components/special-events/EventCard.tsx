import type { Sparplan } from '../../utils/sparplan-utils'
import { getRelationshipTypeLabel, getExpenseTypeLabel } from '../../../helpers/inheritance-tax'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface EventCardProps {
  sparplan: Sparplan
  onDelete: (id: number) => void
}

export function EventCard({ sparplan, onDelete }: EventCardProps) {
  const isInheritance = sparplan.eventType === 'inheritance'
  const isExpense = sparplan.eventType === 'expense'
  const eventPhase = sparplan.specialEventData?.phase || 'sparphase'
  const phaseLabel = eventPhase === 'sparphase' ? 'Sparphase' : 'Entsparphase'
  const phaseColor = eventPhase === 'sparphase' ? 'blue' : 'purple'

  return (
    <Card
      nestingLevel={2}
      className={`p-4 ${
        isInheritance
          ? 'bg-green-50 border-green-200'
          : isExpense
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-bold">
              {isInheritance ? '🎯 Erbschaft' : isExpense ? '🎯 Ausgabe' : '💰 Einmalzahlung'}
            </span>
            <span className="text-sm text-gray-600">
              📅
              {new Date(sparplan.start).toLocaleDateString('de-DE')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full bg-${phaseColor}-100 text-${phaseColor}-700 font-medium`}>
              {phaseLabel}
            </span>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">📅 Datum:</span>
              <span className="text-sm font-semibold text-blue-600">
                {new Date(sparplan.start).toLocaleDateString('de-DE')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                {isInheritance
                  ? '💰 Netto-Erbschaft:'
                  : isExpense
                    ? '💸 Ausgabe:'
                    : '💰 Betrag:'}
              </span>
              <span className={`text-sm font-semibold ${
                isInheritance ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-blue-600'
              }`}
              >
                {Math.abs(sparplan.einzahlung).toLocaleString('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </div>

            {isInheritance && sparplan.specialEventData?.relationshipType && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">👥 Verwandtschaft:</span>
                <span className="text-sm font-semibold text-green-600">
                  {getRelationshipTypeLabel(sparplan.specialEventData.relationshipType)}
                </span>
              </div>
            )}

            {isExpense && sparplan.specialEventData?.expenseType && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">🏷️ Typ:</span>
                <span className="text-sm font-semibold text-red-600">
                  {getExpenseTypeLabel(sparplan.specialEventData.expenseType)}
                </span>
              </div>
            )}

            {sparplan.specialEventData?.description && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">📝 Beschreibung:</span>
                <span className="text-sm font-semibold text-gray-700">
                  {sparplan.specialEventData.description}
                </span>
              </div>
            )}

            {isExpense && sparplan.specialEventData?.creditTerms && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">💳 Kredit:</span>
                <span className="text-sm font-semibold text-red-600">
                  {(sparplan.specialEventData.creditTerms.interestRate * 100).toFixed(1)}
                  % /
                  {sparplan.specialEventData.creditTerms.termYears}
                  J
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(sparplan.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            🗑️
          </Button>
        </div>
      </div>
    </Card>
  )
}
