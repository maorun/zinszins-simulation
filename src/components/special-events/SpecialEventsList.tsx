import type { Sparplan } from '../../utils/sparplan-utils'
import { getRelationshipTypeLabel, getExpenseTypeLabel } from '../../../helpers/inheritance-tax'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

interface SpecialEventsListProps {
  currentSparplans: Sparplan[]
  onDelete: (id: number) => void
}

interface EventMetadata {
  isInheritance: boolean
  isExpense: boolean
  eventPhase: string
  phaseLabel: string
  phaseColor: string
}

/**
 * Get metadata for special event
 */
function getEventMetadata(sparplan: Sparplan): EventMetadata {
  const isInheritance = sparplan.eventType === 'inheritance'
  const isExpense = sparplan.eventType === 'expense'
  const eventPhase = sparplan.specialEventData?.phase || 'sparphase'
  const phaseLabel = eventPhase === 'sparphase' ? 'Sparphase' : 'Entsparphase'
  const phaseColor = eventPhase === 'sparphase' ? 'blue' : 'purple'

  return { isInheritance, isExpense, eventPhase, phaseLabel, phaseColor }
}

/**
 * Get event type label and icon
 */
function getEventTypeInfo(isInheritance: boolean, isExpense: boolean) {
  if (isInheritance) return { icon: '🎯 Erbschaft', amountLabel: '💰 Netto-Erbschaft:', colorClass: 'text-green-600' }
  if (isExpense) return { icon: '🎯 Ausgabe', amountLabel: '💸 Ausgabe:', colorClass: 'text-red-600' }
  return { icon: '💰 Einmalzahlung', amountLabel: '💰 Betrag:', colorClass: 'text-blue-600' }
}

/**
 * Get card background class
 */
function getCardBackgroundClass(isInheritance: boolean, isExpense: boolean): string {
  if (isInheritance) return 'bg-green-50 border-green-200'
  if (isExpense) return 'bg-red-50 border-red-200'
  return 'bg-blue-50 border-blue-200'
}

/**
 * Component to display list of special events
 * Extracted from SpecialEvents to reduce complexity
 */
export function SpecialEventsList({
  currentSparplans,
  onDelete,
}: SpecialEventsListProps) {
  const specialEvents = currentSparplans.filter(
    sparplan => sparplan.eventType && sparplan.eventType !== 'normal',
  )

  if (specialEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Noch keine Sonderereignisse konfiguriert
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {specialEvents.map((sparplan) => {
        const { isInheritance, isExpense, phaseLabel, phaseColor } = getEventMetadata(sparplan)
        const { icon, amountLabel, colorClass } = getEventTypeInfo(isInheritance, isExpense)
        const bgClass = getCardBackgroundClass(isInheritance, isExpense)

        return (
          <Card
            key={sparplan.id}
            nestingLevel={2}
            className={`p-4 ${bgClass}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-bold">{icon}</span>
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
                    <span className="text-sm font-medium text-gray-600">{amountLabel}</span>
                    <span className={`text-sm font-semibold ${colorClass}`}>
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

                  {isInheritance && sparplan.specialEventData?.grossInheritanceAmount !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">💵 Brutto-Erbe:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {Number(sparplan.specialEventData.grossInheritanceAmount).toLocaleString('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    </div>
                  )}

                  {isExpense && sparplan.specialEventData?.creditTerms && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">💳 Kredit:</span>
                        <span className="text-sm font-semibold text-red-600">Ja</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">📊 Zinssatz:</span>
                        <span className="text-sm font-semibold text-red-600">
                          {(sparplan.specialEventData.creditTerms.interestRate * 100).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">⏰ Laufzeit:</span>
                        <span className="text-sm font-semibold text-red-600">
                          {sparplan.specialEventData.creditTerms.termYears}
                          {' '}
                          Jahre
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">💰 Monatliche Rate:</span>
                        <span className="text-sm font-semibold text-red-600">
                          {(sparplan.specialEventData.creditTerms.monthlyPayment ?? 0).toLocaleString('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(sparplan.id)}
                className="ml-4"
              >
                Löschen
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
