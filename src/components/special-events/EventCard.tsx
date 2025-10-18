import type { Sparplan } from '../../utils/sparplan-utils'
import { getRelationshipTypeLabel, getExpenseTypeLabel } from '../../../helpers/inheritance-tax'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface EventCardProps {
  sparplan: Sparplan
  onDelete: (id: number) => void
}

interface EventStyle {
  cardClasses: string
  title: string
  amountLabel: string
  amountColor: string
}

function getEventStyle(isInheritance: boolean, isExpense: boolean): EventStyle {
  if (isInheritance) {
    return {
      cardClasses: 'bg-green-50 border-green-200',
      title: '🎯 Erbschaft',
      amountLabel: '💰 Netto-Erbschaft:',
      amountColor: 'text-green-600',
    }
  }

  if (isExpense) {
    return {
      cardClasses: 'bg-red-50 border-red-200',
      title: '🎯 Ausgabe',
      amountLabel: '💸 Ausgabe:',
      amountColor: 'text-red-600',
    }
  }

  return {
    cardClasses: 'bg-blue-50 border-blue-200',
    title: '💰 Einmalzahlung',
    amountLabel: '💰 Betrag:',
    amountColor: 'text-blue-600',
  }
}

function getPhaseInfo(phase: string) {
  const isSparphase = phase === 'sparphase'
  return {
    label: isSparphase ? 'Sparphase' : 'Entsparphase',
    color: isSparphase ? 'blue' : 'purple',
  }
}

/**
 * Render inheritance-specific fields
 */
function InheritanceFields({ sparplan }: { sparplan: Sparplan }) {
  const relationshipType = sparplan.specialEventData?.relationshipType
  if (!relationshipType) return null

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600">👥 Verwandtschaft:</span>
      <span className="text-sm font-semibold text-green-600">
        {getRelationshipTypeLabel(relationshipType as any)}
      </span>
    </div>
  )
}

/**
 * Render expense type field
 */
function ExpenseTypeField({ sparplan }: { sparplan: Sparplan }) {
  const expenseType = sparplan.specialEventData?.expenseType
  if (!expenseType) return null

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600">🏷️ Typ:</span>
      <span className="text-sm font-semibold text-red-600">
        {getExpenseTypeLabel(expenseType as any)}
      </span>
    </div>
  )
}

/**
 * Render credit terms field
 */
function CreditTermsField({ creditTerms }: { creditTerms?: { interestRate: number, termYears: number } }) {
  if (!creditTerms) return null

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600">💳 Kredit:</span>
      <span className="text-sm font-semibold text-red-600">
        {(creditTerms.interestRate * 100).toFixed(1)}
        % /
        {creditTerms.termYears}
        J
      </span>
    </div>
  )
}

/**
 * Render description field
 */
function DescriptionField({ description }: { description?: string }) {
  if (!description) return null

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600">📝 Beschreibung:</span>
      <span className="text-sm font-semibold text-gray-700">
        {description}
      </span>
    </div>
  )
}

export function EventCard({ sparplan, onDelete }: EventCardProps) {
  const isInheritance = sparplan.eventType === 'inheritance'
  const isExpense = sparplan.eventType === 'expense'
  const eventPhase = sparplan.specialEventData?.phase || 'sparphase'

  const style = getEventStyle(isInheritance, isExpense)
  const phase = getPhaseInfo(eventPhase)
  const formattedDate = new Date(sparplan.start).toLocaleDateString('de-DE')
  const formattedAmount = Math.abs(sparplan.einzahlung).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })

  return (
    <Card
      nestingLevel={2}
      className={`p-4 ${style.cardClasses}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-bold">{style.title}</span>
            <span className="text-sm text-gray-600">
              📅
              {formattedDate}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full bg-${phase.color}-100 text-${phase.color}-700 font-medium`}>
              {phase.label}
            </span>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">📅 Datum:</span>
              <span className="text-sm font-semibold text-blue-600">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{style.amountLabel}</span>
              <span className={`text-sm font-semibold ${style.amountColor}`}>
                {formattedAmount}
              </span>
            </div>

            {isInheritance && <InheritanceFields sparplan={sparplan} />}

            {isExpense && <ExpenseTypeField sparplan={sparplan} />}

            <DescriptionField description={sparplan.specialEventData?.description} />

            {isExpense && (
              <CreditTermsField creditTerms={sparplan.specialEventData?.creditTerms} />
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
