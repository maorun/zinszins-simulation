import type { Sparplan } from '../../utils/sparplan-utils'
import { getRelationshipTypeLabel, getExpenseTypeLabel } from '../../../helpers/inheritance-tax'
import { getCareLevelDisplayName, DEFAULT_CARE_LEVELS } from '../../../helpers/care-cost-simulation'
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

function getEventStyle(isInheritance: boolean, isExpense: boolean, isCareCost: boolean): EventStyle {
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

  if (isCareCost) {
    return {
      cardClasses: 'bg-orange-50 border-orange-200',
      title: '🏥 Pflegekosten',
      amountLabel: '💸 Jährliche Nettokosten:',
      amountColor: 'text-orange-600',
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
      <span className="text-sm font-semibold text-green-600">{getRelationshipTypeLabel(relationshipType)}</span>
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
      <span className="text-sm font-semibold text-red-600">{getExpenseTypeLabel(expenseType)}</span>
    </div>
  )
}

/**
 * Render credit terms field
 */
function CreditTermsField({ creditTerms }: { creditTerms?: { interestRate: number; termYears: number } }) {
  if (!creditTerms) return null

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600">💳 Kredit:</span>
      <span className="text-sm font-semibold text-red-600">
        {(creditTerms.interestRate * 100).toFixed(1)}% /{creditTerms.termYears}J
      </span>
    </div>
  )
}

/**
 * Helper: Format monthly costs display
 */
function formatMonthlyCosts(customMonthlyCosts: number | undefined, typicalCost: number): string {
  if (customMonthlyCosts) {
    return `${customMonthlyCosts.toLocaleString('de-DE')} €`
  }
  return `${typicalCost.toLocaleString('de-DE')} € (typisch)`
}

/**
 * Helper: Format duration display
 */
function formatDuration(careDurationYears: number | undefined): string {
  return careDurationYears && careDurationYears > 0 ? `${careDurationYears} Jahre` : 'Bis Lebensende'
}

/**
 * Render care cost-specific fields
 */
function CareCostFields({ sparplan }: { sparplan: Sparplan }) {
  const careLevel = sparplan.specialEventData?.careLevel
  const customMonthlyCosts = sparplan.specialEventData?.customMonthlyCosts
  const careDurationYears = sparplan.specialEventData?.careDurationYears
  const careInflationRate = sparplan.specialEventData?.careInflationRate

  if (!careLevel) return null

  const careLevelInfo = DEFAULT_CARE_LEVELS[careLevel as 1 | 2 | 3 | 4 | 5]

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">🏥 Pflegegrad:</span>
        <span className="text-sm font-semibold text-orange-600">{getCareLevelDisplayName(careLevel as 1 | 2 | 3 | 4 | 5)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">💰 Monatl. Kosten:</span>
        <span className="text-sm font-semibold text-orange-600">
          {formatMonthlyCosts(customMonthlyCosts, careLevelInfo.typicalMonthlyCost)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">⏱️ Dauer:</span>
        <span className="text-sm font-semibold text-orange-600">{formatDuration(careDurationYears)}</span>
      </div>
      {careInflationRate !== undefined && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">📈 Inflation:</span>
          <span className="text-sm font-semibold text-orange-600">{careInflationRate}%</span>
        </div>
      )}
    </>
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
      <span className="text-sm font-semibold text-gray-700">{description}</span>
    </div>
  )
}

/**
 * Event details section
 */
function EventDetails({
  isInheritance,
  isExpense,
  isCareCost,
  style,
  formattedDate,
  formattedAmount,
  sparplan,
}: {
  isInheritance: boolean
  isExpense: boolean
  isCareCost: boolean
  style: ReturnType<typeof getEventStyle>
  formattedDate: string
  formattedAmount: string
  sparplan: Sparplan
}) {
  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">📅 Datum:</span>
        <span className="text-sm font-semibold text-blue-600">{formattedDate}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">{style.amountLabel}</span>
        <span className={`text-sm font-semibold ${style.amountColor}`}>{formattedAmount}</span>
      </div>

      {isInheritance && <InheritanceFields sparplan={sparplan} />}

      {isExpense && <ExpenseTypeField sparplan={sparplan} />}

      {isCareCost && <CareCostFields sparplan={sparplan} />}

      <DescriptionField description={sparplan.specialEventData?.description} />

      {isExpense && <CreditTermsField creditTerms={sparplan.specialEventData?.creditTerms} />}
    </div>
  )
}

/**
 * Event header with title, date, and phase badge
 */
function EventHeader({
  style,
  formattedDate,
  phase,
}: {
  style: EventStyle
  formattedDate: string
  phase: ReturnType<typeof getPhaseInfo>
}) {
  return (
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
  )
}

export function EventCard({ sparplan, onDelete }: EventCardProps) {
  const isInheritance = sparplan.eventType === 'inheritance'
  const isExpense = sparplan.eventType === 'expense'
  const isCareCost = sparplan.eventType === 'care_costs'
  const eventPhase = sparplan.specialEventData?.phase || 'sparphase'

  const style = getEventStyle(isInheritance, isExpense, isCareCost)
  const phase = getPhaseInfo(eventPhase)
  const formattedDate = new Date(sparplan.start).toLocaleDateString('de-DE')
  const formattedAmount = Math.abs(sparplan.einzahlung).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })

  return (
    <Card nestingLevel={2} className={`p-4 ${style.cardClasses}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <EventHeader style={style} formattedDate={formattedDate} phase={phase} />

          <EventDetails
            isInheritance={isInheritance}
            isExpense={isExpense}
            isCareCost={isCareCost}
            style={style}
            formattedDate={formattedDate}
            formattedAmount={formattedAmount}
            sparplan={sparplan}
          />
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
