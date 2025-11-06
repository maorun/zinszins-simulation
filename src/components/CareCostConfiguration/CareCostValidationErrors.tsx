import { Card, CardContent } from '../ui/card'
import { AlertCircle } from 'lucide-react'

interface CareCostValidationErrorsProps {
  errors: string[]
  nestingLevel: number
}

export function CareCostValidationErrors({ errors, nestingLevel }: CareCostValidationErrorsProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <Card nestingLevel={nestingLevel + 1} className="bg-red-50 border-red-200">
      <CardContent nestingLevel={nestingLevel + 1} className="pt-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <div className="font-medium mb-1">Konfigurationsfehler:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
