import { formatCurrency } from '../../utils/currency'
import type { HealthCareInsuranceYearResult } from '../../../helpers/health-care-insurance'

interface IndividualPreviewDisplayProps {
  individualResults: HealthCareInsuranceYearResult
  withdrawalAmount: number
}

/**
 * Display component for individual health insurance cost preview
 */
export function IndividualPreviewDisplay({ individualResults, withdrawalAmount }: IndividualPreviewDisplayProps) {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-medium text-sm text-blue-900 mb-3">
        💰 Kostenvorschau (bei {formatCurrency(withdrawalAmount)} Entnahme)
      </h4>

      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Jährlich:</span> {formatCurrency(individualResults.totalAnnual)}
        </div>
        <div className="text-sm">
          <span className="font-medium">Monatlich:</span> {formatCurrency(individualResults.totalMonthly)}
        </div>
        <div className="text-xs text-blue-700">
          Krankenversicherung: {formatCurrency(individualResults.healthInsuranceAnnual)} / Jahr • Pflegeversicherung:{' '}
          {formatCurrency(individualResults.careInsuranceAnnual)} / Jahr
        </div>
      </div>
    </div>
  )
}
