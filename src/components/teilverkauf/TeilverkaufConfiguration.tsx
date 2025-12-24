import { Building2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { ImmobilienTeilverkaufConfig } from '../../../helpers/immobilien-teilverkauf'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import { TeilverkaufFormFields } from './TeilverkaufFormFields'

interface TeilverkaufConfigurationProps {
  config: ImmobilienTeilverkaufConfig
  setConfig: (config: ImmobilienTeilverkaufConfig) => void
}

export function TeilverkaufConfiguration({ config, setConfig }: TeilverkaufConfigurationProps) {
  const ids = useMemo(
    () => ({
      enabled: generateFormId('teilverkauf-config', 'enabled'),
      propertyValue: generateFormId('teilverkauf-config', 'property-value'),
      salePercentage: generateFormId('teilverkauf-config', 'sale-percentage'),
      saleAge: generateFormId('teilverkauf-config', 'sale-age'),
      niessbrauchFeeRate: generateFormId('teilverkauf-config', 'niessbrauch-fee-rate'),
      transactionCostsRate: generateFormId('teilverkauf-config', 'transaction-costs-rate'),
      appreciationRate: generateFormId('teilverkauf-config', 'appreciation-rate'),
    }),
    [],
  )

  const updateTeilverkauf = (updates: Partial<typeof config.teilverkauf>) => {
    setConfig({ ...config, teilverkauf: { ...config.teilverkauf, ...updates } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          Immobilien-Teilverkauf
        </h3>
        <div className="flex items-center gap-2">
          <Label htmlFor={ids.enabled}>Aktivieren</Label>
          <Switch
            id={ids.enabled}
            checked={config.teilverkauf.enabled}
            onCheckedChange={checked => updateTeilverkauf({ enabled: checked })}
          />
        </div>
      </div>

      {config.teilverkauf.enabled && (
        <div className="space-y-4 pt-4 border-t">
          <TeilverkaufFormFields ids={ids} values={config.teilverkauf} onChange={updateTeilverkauf} />
        </div>
      )}
    </div>
  )
}
