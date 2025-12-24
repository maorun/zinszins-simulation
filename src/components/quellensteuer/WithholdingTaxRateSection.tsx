import React from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import type { CountryWithholdingTaxRate } from '../../../helpers/quellensteuer'

interface WithholdingTaxRateSectionProps {
  showCustomRate: boolean
  withholdingTaxRate: number
  selectedCountry?: CountryWithholdingTaxRate
  customRateInputId: string
  onCustomRateToggle: () => void
  onWithholdingTaxRateChange: (rate: number) => void
}

export function WithholdingTaxRateSection({
  showCustomRate,
  withholdingTaxRate,
  selectedCountry,
  customRateInputId,
  onCustomRateToggle,
  onWithholdingTaxRateChange,
}: WithholdingTaxRateSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Quellensteuersatz</Label>
        <Button variant="outline" size="sm" onClick={onCustomRateToggle} className="text-xs">
          {showCustomRate ? 'DBA-Satz verwenden' : 'Benutzerdefinierten Satz'}
        </Button>
      </div>
      {showCustomRate ? (
        <div className="space-y-2">
          <Input
            id={customRateInputId}
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={(withholdingTaxRate * 100).toFixed(1)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onWithholdingTaxRateChange(Number(e.target.value) / 100)
            }
            placeholder="15.0"
          />
          <p className="text-xs text-muted-foreground">
            Geben Sie den tatsächlich einbehaltenen Quellensteuersatz in Prozent ein.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-white rounded border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">DBA-Satz {selectedCountry?.country}:</span>
            <span className="text-lg font-bold text-green-600">{(withholdingTaxRate * 100).toFixed(1)}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Reduzierter Satz nach Doppelbesteuerungsabkommen</p>
        </div>
      )}
    </div>
  )
}
