import type { EmergencyFundStatus } from '../../../helpers/emergency-fund'
import { formatCurrency } from '../../utils/currency'

interface EmergencyFundStatusDisplayProps {
  currentCapital: number
  fundStatus: EmergencyFundStatus
}

export function EmergencyFundStatusDisplay({ currentCapital, fundStatus }: EmergencyFundStatusDisplayProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold mb-2">Aktueller Status</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-600">Verfügbares Kapital:</p>
          <p className="font-bold text-lg">{formatCurrency(currentCapital)}</p>
        </div>
        <div>
          <p className="text-gray-600">Ziel-Notfallfonds:</p>
          <p className="font-bold text-lg">{formatCurrency(fundStatus.targetAmount)}</p>
        </div>
        <div>
          <p className="text-gray-600">Fortschritt:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${fundStatus.isFunded ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, fundStatus.progress)}%` }}
              />
            </div>
            <span className="font-bold">{fundStatus.progress.toFixed(0)}%</span>
          </div>
        </div>
        <div>
          <p className="text-gray-600">Abgedeckte Monate:</p>
          <p className="font-bold text-lg">{fundStatus.monthsCovered.toFixed(1)} Monate</p>
        </div>
      </div>
      {!fundStatus.isFunded && (
        <p className="text-sm text-orange-700 mt-3">
          <strong>Fehlbetrag:</strong> {formatCurrency(fundStatus.shortfall)}
        </p>
      )}
      {fundStatus.isFunded && (
        <p className="text-sm text-green-700 mt-3">
          <strong>✓ Ziel erreicht!</strong> Ihr Notfallfonds ist vollständig finanziert.
        </p>
      )}
    </div>
  )
}
