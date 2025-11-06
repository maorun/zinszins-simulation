import type { RealEstateConfig } from '../../../helpers/other-income'

interface RealEstateDetailsProps {
  config: RealEstateConfig
}

export function RealEstateDetails({ config }: RealEstateDetailsProps) {
  return (
    <div className="text-green-700 bg-green-50 p-2 rounded text-xs space-y-1">
      <div className="font-medium">🏠 Immobilien-Details:</div>
      <div>• Immobilienwert: {config.propertyValue.toLocaleString('de-DE')} €</div>
      <div>
        • Instandhaltung: {config.maintenanceCostPercent}
        %, Leerstand: {config.vacancyRatePercent}%
      </div>
      {config.monthlyMortgagePayment > 0 && (
        <div>• Finanzierung: {config.monthlyMortgagePayment.toLocaleString('de-DE')} €/Monat</div>
      )}
      <div>
        • Wertsteigerung: {config.propertyAppreciationRate}%
        {config.includeAppreciation ? ' (berücksichtigt)' : ' (nicht berücksichtigt)'}
      </div>
    </div>
  )
}
