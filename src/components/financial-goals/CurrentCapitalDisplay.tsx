import { Alert, AlertDescription } from '../ui/alert'
import { formatEuro } from './helpers'

interface CurrentCapitalDisplayProps {
  currentCapital: number
}

export function CurrentCapitalDisplay({ currentCapital }: CurrentCapitalDisplayProps) {
  return (
    <Alert>
      <AlertDescription>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Aktuelles Endkapital (Ansparphase):</span>
          <span className="text-lg font-bold text-blue-600">
            {formatEuro(currentCapital)}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
