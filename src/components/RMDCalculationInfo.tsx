import { getRMDDescription } from '../../helpers/rmd-tables'

interface RMDCalculationInfoProps {
  startAge: number
}

export function RMDCalculationInfo({ startAge }: RMDCalculationInfoProps) {
  return (
    <div className="p-3 bg-blue-50 rounded-md">
      <div className="text-sm font-medium text-blue-900 mb-1">
        Entnahme-Berechnung
      </div>
      <div className="text-sm text-blue-800">
        {getRMDDescription(startAge)}
      </div>
      <div className="text-xs text-blue-700 mt-2">
        Die jährliche Entnahme wird berechnet als:
        {' '}
        <strong>Portfoliowert ÷ Divisor (Lebenserwartung)</strong>
        <br />
        Der Divisor sinkt mit jedem Jahr, wodurch die Entnahme steigt
        und das Portfolio bis zum Lebensende aufgebraucht wird.
      </div>
    </div>
  )
}
