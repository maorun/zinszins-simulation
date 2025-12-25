import { DollarSign } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { EigenheimVsMieteConfig } from '../../../helpers/eigenheim-vs-miete'

interface RentalConfigProps {
  config: EigenheimVsMieteConfig
  setConfig: (config: EigenheimVsMieteConfig) => void
  ids: Record<string, string>
}

export function RentalConfiguration({ config, setConfig, ids }: RentalConfigProps) {
  const handleMonthlyRentChange = (value: string) => {
    setConfig({ ...config, rental: { ...config.rental, monthlyRent: parseFloat(value) || 0 } })
  }

  const handleRentIncreaseChange = (value: string) => {
    setConfig({ ...config, rental: { ...config.rental, annualRentIncrease: parseFloat(value) || 0 } })
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-blue-600" />
        Miet-Szenario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={ids.monthlyRent}>Monatliche Kaltmiete (€)</Label>
          <Input id={ids.monthlyRent} type="number" min={0} step={50} value={config.rental.monthlyRent} onChange={(e) => handleMonthlyRentChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.rentIncrease}>Jährliche Mieterhöhung (%)</Label>
          <Input id={ids.rentIncrease} type="number" min={0} max={10} step={0.1} value={config.rental.annualRentIncrease} onChange={(e) => handleRentIncreaseChange(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
