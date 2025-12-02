import { TrendingUp } from 'lucide-react'
import type { ImmobilienTeilverkaufConfig } from '../../../helpers/immobilien-teilverkauf'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import { InputField } from './InputField'

interface ComparisonSettingsProps {
  config: ImmobilienTeilverkaufConfig
  setConfig: (config: ImmobilienTeilverkaufConfig) => void
}

export function ComparisonSettings({ config, setConfig }: ComparisonSettingsProps) {
  const ids = useMemo(
    () => ({
      monthlyRent: generateFormId('teilverkauf-comparison', 'monthly-rent'),
      rentIncrease: generateFormId('teilverkauf-comparison', 'rent-increase'),
      investmentReturn: generateFormId('teilverkauf-comparison', 'investment-return'),
      leibrentePayment: generateFormId('teilverkauf-comparison', 'leibrente-payment'),
    }),
    [],
  )

  const updateComparison = (updates: Partial<typeof config.comparison>) => {
    setConfig({ ...config, comparison: { ...config.comparison, ...updates } })
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-purple-600" />
        Vergleichsszenarien
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id={ids.monthlyRent} label="Alternative Miete monatlich (€)" value={config.comparison.alternativeMonthlyRent} onChange={(v) => updateComparison({ alternativeMonthlyRent: parseFloat(v) || 0 })} min={0} step={50} helpText="Bei Vollverkauf + Miete" />
        <InputField id={ids.rentIncrease} label="Mietsteigerung p.a. (%)" value={config.comparison.rentIncreaseRate} onChange={(v) => updateComparison({ rentIncreaseRate: parseFloat(v) || 0 })} min={0} max={10} step={0.1} />
        <InputField id={ids.investmentReturn} label="Anlagerendite p.a. (%)" value={config.comparison.investmentReturnRate} onChange={(v) => updateComparison({ investmentReturnRate: parseFloat(v) || 0 })} min={0} max={15} step={0.1} helpText="Rendite bei Vollverkauf" />
        <InputField id={ids.leibrentePayment} label="Leibrente monatlich (€)" value={config.comparison.leibrenteMonthlyPayment} onChange={(v) => updateComparison({ leibrenteMonthlyPayment: parseFloat(v) || 0 })} min={0} step={50} helpText="Alternative Leibrente" />
      </div>
    </div>
  )
}
