import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Info } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import type { CareCostYearResult } from '../../../helpers/care-cost-simulation'

interface CareCostPreviewProps {
  previewYear: number
  previewResult: CareCostYearResult
  nestingLevel: number
}

export function CareCostPreview({
  previewYear,
  previewResult,
  nestingLevel,
}: CareCostPreviewProps) {
  if (!previewResult.careNeeded) {
    return null
  }

  return (
    <Card nestingLevel={nestingLevel + 1} className="bg-green-50 border-green-200">
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          Kostenvorschau für
          {' '}
          {previewYear}
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Brutto-Pflegekosten:</span>
            <br />
            {formatCurrency(previewResult.monthlyCostsGross)}
            /Monat
          </div>
          <div>
            <span className="font-medium">Gesetzliche Leistungen:</span>
            <br />
            {formatCurrency(previewResult.monthlyStatutoryBenefits)}
            /Monat
          </div>
          <div>
            <span className="font-medium">Private Leistungen:</span>
            <br />
            {formatCurrency(previewResult.monthlyPrivateBenefits)}
            /Monat
          </div>
          <div>
            <span className="font-medium">Netto-Eigenanteil:</span>
            <br />
            <span className="text-lg font-semibold text-green-800">
              {formatCurrency(previewResult.monthlyCostsNet)}
              /Monat
            </span>
          </div>
          <div className="md:col-span-2 pt-2 border-t border-green-300">
            <span className="font-medium">Jährliche Netto-Kosten:</span>
            <br />
            <span className="text-lg font-semibold text-green-800">
              {formatCurrency(previewResult.annualCostsNet)}
            </span>
            {previewResult.taxDeductionAmount > 0 && (
              <>
                <br />
                <span className="text-sm text-muted-foreground">
                  Steuerabzug:
                  {' '}
                  {formatCurrency(previewResult.taxDeductionAmount)}
                </span>
              </>
            )}
          </div>

          {previewResult.coupleResults && (
            <div className="md:col-span-2 pt-2 border-t border-green-300">
              <div className="font-medium mb-2">Paar-Aufschlüsselung:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Person 1:</span>
                  <br />
                  {previewResult.coupleResults.person1.needsCare
                    ? `${formatCurrency(previewResult.coupleResults.person1.monthlyCostsNet)}/Monat`
                    : 'Keine Pflege benötigt'}
                </div>
                <div>
                  <span className="font-medium">Person 2:</span>
                  <br />
                  {previewResult.coupleResults.person2.needsCare
                    ? `${formatCurrency(previewResult.coupleResults.person2.monthlyCostsNet)}/Monat`
                    : 'Keine Pflege benötigt'}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
