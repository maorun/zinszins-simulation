import { formatCurrency } from '../../utils/currency'
import type { RuerupTaxDeductionResult, RuerupPensionTaxationResult } from '../../../helpers/ruerup-rente'

interface RuerupTaxCalculationDetailsProps {
  contributionResult: RuerupTaxDeductionResult
  pensionResult: RuerupPensionTaxationResult
  contributionYear: number
  taxablePercentage: number
  deductiblePercentage: number
}

function ContributionPhaseDetails({ contributionResult, contributionYear, deductiblePercentage }: Pick<RuerupTaxCalculationDetailsProps, 'contributionResult' | 'contributionYear' | 'deductiblePercentage'>) {
  return (
    <div className="space-y-2 rounded-lg border p-4 bg-blue-50">
      <h4 className="font-semibold text-sm">Beitragsphase - Steuervorteile</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Absetzbar:</span>
          <p className="font-semibold">{formatCurrency(contributionResult.deductibleAmount)}</p>
        </div>
        <div className="bg-green-100 p-2 rounded">
          <span className="text-gray-600">Steuerersparnis:</span>
          <p className="font-bold text-green-700">{formatCurrency(contributionResult.estimatedTaxSavings)}</p>
        </div>
      </div>
      <p className="text-xs text-gray-600">
        {(deductiblePercentage * 100).toFixed(0)}% absetzbar in {contributionYear}
      </p>
    </div>
  )
}

function PensionPhaseDetails({ pensionResult, taxablePercentage }: Pick<RuerupTaxCalculationDetailsProps, 'pensionResult' | 'taxablePercentage'>) {
  return (
    <div className="space-y-2 rounded-lg border p-4 bg-orange-50">
      <h4 className="font-semibold text-sm">Rentenphase - Besteuerung</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Bruttorente (Jahr):</span>
          <p className="font-semibold">{formatCurrency(pensionResult.grossAnnualPension)}</p>
        </div>
        <div>
          <span className="text-gray-600">Steuerpflichtig ({(taxablePercentage * 100).toFixed(0)}%):</span>
          <p className="font-semibold">{formatCurrency(pensionResult.taxableAmount)}</p>
        </div>
        <div className="bg-orange-100 p-2 rounded">
          <span className="text-gray-600">Einkommensteuer:</span>
          <p className="font-bold text-orange-700">{formatCurrency(pensionResult.incomeTax)}</p>
        </div>
        <div className="bg-green-100 p-2 rounded">
          <span className="text-gray-600">Nettorente (Jahr):</span>
          <p className="font-bold text-green-700">{formatCurrency(pensionResult.netAnnualPension)}</p>
        </div>
      </div>
    </div>
  )
}

function ImportantNotesSection() {
  return (
    <div className="text-xs text-gray-600 space-y-1 border-t pt-3">
      <p className="font-semibold">Wichtige Hinweise:</p>
      <ul className="list-disc list-inside space-y-0.5">
        <li>Beiträge ab 2025: 100% steuerlich absetzbar (bis Höchstbetrag)</li>
        <li>Renten werden nachgelagert besteuert (Besteuerungsanteil abhängig vom Rentenbeginn)</li>
        <li>Keine Kapitalauszahlung möglich - nur lebenslange Rente</li>
        <li>Besonders vorteilhaft für Selbstständige und Gutverdiener</li>
      </ul>
    </div>
  )
}

export function RuerupTaxCalculationDetails(props: RuerupTaxCalculationDetailsProps) {
  const { contributionResult, pensionResult, contributionYear, taxablePercentage, deductiblePercentage } = props

  return (
    <div className="space-y-4 mt-4">
      <ContributionPhaseDetails
        contributionResult={contributionResult}
        contributionYear={contributionYear}
        deductiblePercentage={deductiblePercentage}
      />
      <PensionPhaseDetails
        pensionResult={pensionResult}
        taxablePercentage={taxablePercentage}
      />
      <ImportantNotesSection />
    </div>
  )
}
