import { formatCurrency } from '../../utils/currency'
import type { CoupleHealthInsuranceYearResult } from '../../../helpers/health-care-insurance'

interface CouplePreviewDisplayProps {
  coupleResults: CoupleHealthInsuranceYearResult
  withdrawalAmount: number
}

interface PersonDisplayProps {
  person: CoupleHealthInsuranceYearResult['person1']
  color: 'blue' | 'purple'
}

function PersonDisplay({ person, color }: PersonDisplayProps) {
  return (
    <div className="space-y-2">
      <div className={`text-sm font-medium text-${color}-700`}>👤 {person.name}</div>
      <div className="text-xs space-y-1">
        <div>Jährlich: {formatCurrency(person.healthInsuranceResult.totalAnnual)}</div>
        <div>Monatlich: {formatCurrency(person.healthInsuranceResult.totalMonthly)}</div>
        <div className={`text-${color}-600`}>
          {person.coveredByFamilyInsurance ? '👨‍👩‍👧‍👦 Familienversichert' : '💳 Eigenversichert'}
        </div>
      </div>
    </div>
  )
}

/**
 * Display component for couple health insurance cost preview
 */
export function CouplePreviewDisplay({ coupleResults, withdrawalAmount }: CouplePreviewDisplayProps) {
  return (
    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <h4 className="font-medium text-sm text-green-900 mb-3 flex items-center gap-2">
        💰 Kostenvorschau (bei {formatCurrency(withdrawalAmount)} Entnahme)
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <PersonDisplay person={coupleResults.person1} color="blue" />
        <PersonDisplay person={coupleResults.person2} color="purple" />
      </div>

      <div className="pt-3 border-t border-green-300">
        <div className="text-sm font-medium text-green-900">
          Gesamt: {formatCurrency(coupleResults.totalAnnual)} / Jahr • {formatCurrency(coupleResults.totalMonthly)} /
          Monat
        </div>
        <div className="text-xs text-green-700 mt-1">
          Strategie:{' '}
          {coupleResults.strategyUsed === 'family'
            ? '👨‍👩‍👧‍👦 Familienversicherung'
            : coupleResults.strategyUsed === 'individual'
              ? '💳 Einzelversicherung'
              : '🎯 Optimiert'}
        </div>
      </div>
    </div>
  )
}
