interface TaxCalculationDisplayProps {
  inheritanceTaxCalc: {
    grossAmount: number
    exemption: number
    taxableAmount: number
    netAmount: number
  } | null
}

export function TaxCalculationDisplay({ inheritanceTaxCalc }: TaxCalculationDisplayProps) {
  if (!inheritanceTaxCalc) {
    return null
  }

  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="text-sm font-semibold text-green-800 mb-2">📊 Steuerberechnung:</div>
      <div className="text-sm text-green-700 space-y-1">
        <div>
          Brutto-Erbschaft:
          {' '}
          <span className="font-semibold">
            {inheritanceTaxCalc.grossAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
        <div>
          Freibetrag:
          {' '}
          <span className="font-semibold">
            {inheritanceTaxCalc.exemption.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
        <div>
          Steuerpflichtiger Betrag:
          {' '}
          <span className="font-semibold">
            {inheritanceTaxCalc.taxableAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
        <div className="font-semibold border-t pt-1 mt-2">
          Netto-Erbschaft:
          {' '}
          <span className="text-green-900">
            {inheritanceTaxCalc.netAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>
    </div>
  )
}
