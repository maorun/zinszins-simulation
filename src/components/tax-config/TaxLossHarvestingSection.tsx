import { Switch } from '../ui/switch'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Info } from 'lucide-react'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import { GlossaryTerm } from '../GlossaryTerm'

interface TaxLossHarvestingConfig {
  enabled: boolean
  realizedStockLosses: number
  realizedOtherLosses: number
  lossCarryForward: number
}

interface TaxLossHarvestingSectionProps {
  config: TaxLossHarvestingConfig
  onConfigChange: (config: TaxLossHarvestingConfig) => void
}

interface LossInputFieldProps {
  id: string
  label: string
  description: string
  value: number
  onChange: (value: number) => void
}

function LossInputField({ id, label, description, value, onChange }: LossInputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Input
        id={id}
        type="number"
        min="0"
        step="100"
        value={value}
        onChange={e => {
          const parsedValue = parseFloat(e.target.value)
          if (!isNaN(parsedValue)) {
            onChange(parsedValue)
          }
        }}
        className="max-w-xs"
      />
    </div>
  )
}

function TaxLossHarvestingFields({
  config,
  stockLossesId,
  otherLossesId,
  carryForwardId,
  handleStockLossesChange,
  handleOtherLossesChange,
  handleCarryForwardChange,
}: {
  config: TaxLossHarvestingConfig
  stockLossesId: string
  otherLossesId: string
  carryForwardId: string
  handleStockLossesChange: (value: number) => void
  handleOtherLossesChange: (value: number) => void
  handleCarryForwardChange: (value: number) => void
}) {
  return (
    <div className="space-y-4 mt-4">
      <TaxRulesInfoBox />

      <LossInputField
        id={stockLossesId}
        label="Realisierte Aktienverluste (€)"
        description="Verluste aus Aktienverkäufen im aktuellen Jahr (nur mit Aktiengewinnen verrechenbar)"
        value={config.realizedStockLosses}
        onChange={handleStockLossesChange}
      />

      <LossInputField
        id={otherLossesId}
        label="Realisierte sonstige Verluste (€)"
        description="Verluste aus anderen Kapitalanlagen (z.B. Anleihen, Fonds) - können mit allen Erträgen verrechnet werden"
        value={config.realizedOtherLosses}
        onChange={handleOtherLossesChange}
      />

      <LossInputField
        id={carryForwardId}
        label="Verlustvortrag aus Vorjahren (€)"
        description="Nicht genutzte Verluste aus früheren Jahren, die in diesem Jahr verwendet werden können"
        value={config.lossCarryForward}
        onChange={handleCarryForwardChange}
      />
    </div>
  )
}

function TaxRulesInfoBox() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">Deutsche Verlustverrechnungsregeln:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              <GlossaryTerm term="aktienverluste">Aktienverluste</GlossaryTerm> können nur mit Aktiengewinnen verrechnet
              werden
            </li>
            <li>Sonstige Verluste können mit allen Kapitalerträgen verrechnet werden</li>
            <li>Verluste können mit der Vorabpauschale verrechnet werden</li>
            <li>Nicht genutzte Verluste werden unbegrenzt vorgetragen (Verlustvortrag)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Tax Loss Harvesting Configuration Section
 *
 * Allows users to configure realized losses for tax optimization through
 * Verlustverrechnung (loss offsetting) according to German tax law.
 */
export function TaxLossHarvestingSection({ config, onConfigChange }: TaxLossHarvestingSectionProps) {
  const enableSwitchId = useMemo(() => generateFormId('tax-loss-harvesting', 'enabled'), [])
  const stockLossesId = useMemo(() => generateFormId('tax-loss-harvesting', 'stock-losses'), [])
  const otherLossesId = useMemo(() => generateFormId('tax-loss-harvesting', 'other-losses'), [])
  const carryForwardId = useMemo(() => generateFormId('tax-loss-harvesting', 'carry-forward'), [])

  const handleEnabledChange = (checked: boolean) => {
    onConfigChange({ ...config, enabled: checked })
  }

  const handleStockLossesChange = (value: number) => {
    onConfigChange({ ...config, realizedStockLosses: Math.max(0, value) })
  }

  const handleOtherLossesChange = (value: number) => {
    onConfigChange({ ...config, realizedOtherLosses: Math.max(0, value) })
  }

  const handleCarryForwardChange = (value: number) => {
    onConfigChange({ ...config, lossCarryForward: Math.max(0, value) })
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-orange-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-medium">📉 Verlustverrechnung (Tax-Loss Harvesting)</Label>
          <p className="text-sm text-muted-foreground">Realisierte Verluste zum Ausgleich von Kapitalerträgen nutzen</p>
        </div>
        <Switch id={enableSwitchId} checked={config.enabled} onCheckedChange={handleEnabledChange} />
      </div>

      {config.enabled && (
        <TaxLossHarvestingFields
          config={config}
          stockLossesId={stockLossesId}
          otherLossesId={otherLossesId}
          carryForwardId={carryForwardId}
          handleStockLossesChange={handleStockLossesChange}
          handleOtherLossesChange={handleOtherLossesChange}
          handleCarryForwardChange={handleCarryForwardChange}
        />
      )}
    </div>
  )
}
