import { Home } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { EigenheimVsMieteConfig } from '../../../helpers/eigenheim-vs-miete'

interface OwnershipConfigProps {
  config: EigenheimVsMieteConfig
  setConfig: (config: EigenheimVsMieteConfig) => void
  ids: Record<string, string>
}

export function OwnershipConfiguration({ config, setConfig, ids }: OwnershipConfigProps) {
  const handlePurchasePriceChange = (value: string) => {
    setConfig({ ...config, ownership: { ...config.ownership, purchasePrice: parseFloat(value) || 0 } })
  }

  const handleDownPaymentChange = (value: string) => {
    setConfig({ ...config, ownership: { ...config.ownership, downPayment: parseFloat(value) || 0 } })
  }

  const handleMortgageRateChange = (value: string) => {
    setConfig({ ...config, ownership: { ...config.ownership, mortgageInterestRate: parseFloat(value) || 0 } })
  }

  const handleMortgageTermChange = (value: string) => {
    setConfig({ ...config, ownership: { ...config.ownership, mortgageTerm: parseInt(value) || 0 } })
  }

  const handlePropertyAppreciationChange = (value: string) => {
    setConfig({ ...config, ownership: { ...config.ownership, propertyAppreciationRate: parseFloat(value) || 0 } })
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Home className="h-4 w-4 text-green-600" />
        Eigenheim-Szenario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={ids.purchasePrice}>Kaufpreis (€)</Label>
          <Input id={ids.purchasePrice} type="number" min={0} step={10000} value={config.ownership.purchasePrice} onChange={(e) => handlePurchasePriceChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.downPayment}>Eigenkapital (€)</Label>
          <Input id={ids.downPayment} type="number" min={0} step={5000} value={config.ownership.downPayment} onChange={(e) => handleDownPaymentChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.mortgageRate}>Darlehenszinssatz (%)</Label>
          <Input id={ids.mortgageRate} type="number" min={0} max={10} step={0.1} value={config.ownership.mortgageInterestRate} onChange={(e) => handleMortgageRateChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.mortgageTerm}>Darlehenslaufzeit (Jahre)</Label>
          <Input id={ids.mortgageTerm} type="number" min={5} max={40} step={1} value={config.ownership.mortgageTerm} onChange={(e) => handleMortgageTermChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.propertyAppreciation}>Wertsteigerung p.a. (%)</Label>
          <Input id={ids.propertyAppreciation} type="number" min={-5} max={10} step={0.1} value={config.ownership.propertyAppreciationRate} onChange={(e) => handlePropertyAppreciationChange(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
