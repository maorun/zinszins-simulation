import { Info } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import type { EigenheimVsMieteConfig } from '../../../helpers/eigenheim-vs-miete'

interface ComparisonSettingsProps {
  config: EigenheimVsMieteConfig
  setConfig: (config: EigenheimVsMieteConfig) => void
  ids: Record<string, string>
}

export function ComparisonSettings({ config, setConfig, ids }: ComparisonSettingsProps) {
  const handleYearsChange = (value: number[]) => {
    setConfig({ ...config, comparison: { ...config.comparison, comparisonYears: value[0] } })
  }

  const handleInvestmentReturnChange = (value: string) => {
    setConfig({ ...config, comparison: { ...config.comparison, investmentReturnRate: parseFloat(value) || 0 } })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Vergleichseinstellungen</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={ids.comparisonYears}>Vergleichszeitraum (Jahre)</Label>
          <Slider
            id={ids.comparisonYears}
            min={5}
            max={40}
            step={1}
            value={[config.comparison.comparisonYears]}
            onValueChange={handleYearsChange}
          />
          <p className="text-sm text-gray-600">{config.comparison.comparisonYears} Jahre</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.investmentReturn}>
            Erwartete Rendite Mieter-Investitionen (%)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Die erwartete jährliche Rendite für Investitionen des Mieters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id={ids.investmentReturn}
            type="number"
            min={0}
            max={15}
            step={0.1}
            value={config.comparison.investmentReturnRate}
            onChange={e => handleInvestmentReturnChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
