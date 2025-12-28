import type { PropertyFinancingConfig } from '../../../helpers/immobilien-leverage'
import { PriceFields, IncomeFields } from './BasicPropertyFields'
import { TaxAndFinancingFields } from './TaxAndFinancingFields'

interface PropertyConfigurationProps {
  config: PropertyFinancingConfig
  baseInterestRate: number
  ids: Record<string, string>
  onConfigChange: <K extends keyof PropertyFinancingConfig>(key: K, value: PropertyFinancingConfig[K]) => void
  onBaseInterestChange: (value: number) => void
}

export function PropertyConfiguration({
  config,
  baseInterestRate,
  ids,
  onConfigChange,
  onBaseInterestChange,
}: PropertyConfigurationProps) {
  const afaRate = config.buildingYear < 1925 ? '2,5%' : config.buildingYear >= 2023 ? '3%' : '2%'
  const grossYield = (config.annualRentalIncome / config.totalPurchasePrice) * 100
  const operatingCostsAmount = config.annualRentalIncome * (config.operatingCostsRate / 100)

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-sm font-semibold">Immobilien-Parameter</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PriceFields config={config} ids={ids} onConfigChange={onConfigChange} />
        <IncomeFields
          config={config}
          ids={ids}
          grossYield={grossYield}
          operatingCostsAmount={operatingCostsAmount}
          onConfigChange={onConfigChange}
        />
        <TaxAndFinancingFields
          config={config}
          ids={ids}
          baseInterestRate={baseInterestRate}
          afaRate={afaRate}
          onConfigChange={onConfigChange}
          onBaseInterestChange={onBaseInterestChange}
        />
      </div>
    </div>
  )
}
