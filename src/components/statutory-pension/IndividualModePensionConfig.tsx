import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'

interface IndividualModePensionConfigProps {
  config: CoupleStatutoryPensionConfig
  onChange: (config: CoupleStatutoryPensionConfig) => void
  nestingLevel: number
}

export function IndividualModePensionConfig({ config, onChange, nestingLevel }: IndividualModePensionConfigProps) {
  if (!config.individual) return null

  return (
    <div className="space-y-4">
      <Card nestingLevel={nestingLevel + 1}>
        <CardHeader nestingLevel={nestingLevel + 1}>
          <CardTitle className="text-base">Rentenplanung</CardTitle>
        </CardHeader>
        <CardContent nestingLevel={nestingLevel + 1}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monatliche Rente (brutto) €</Label>
              <Input
                type="number"
                value={config.individual.monthlyAmount}
                onChange={e => {
                  const updatedConfig = {
                    ...config,
                    individual: {
                      ...config.individual!,
                      monthlyAmount: Number(e.target.value),
                    },
                  }
                  onChange(updatedConfig)
                }}
                min={0}
                step={50}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
