import { useMemo } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Button } from '../ui/button'
import { generateFormId } from '../../utils/unique-id'
import type { SellingStrategyConfig } from '../../../helpers/selling-strategy'

interface SellingStrategyConfigFormProps {
  config: SellingStrategyConfig
  onConfigChange: (updates: Partial<SellingStrategyConfig>) => void
  showComparison: boolean
  onShowComparisonChange: (show: boolean) => void
}

function MethodSelector({
  methodId,
  value,
  onChange,
}: {
  methodId: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={methodId}>Verkaufsmethode</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fifo" id={`${methodId}-fifo`} />
          <Label htmlFor={`${methodId}-fifo`} className="font-normal cursor-pointer">
            FIFO (First In, First Out) - Älteste zuerst
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="lifo" id={`${methodId}-lifo`} />
          <Label htmlFor={`${methodId}-lifo`} className="font-normal cursor-pointer">
            LIFO (Last In, First Out) - Neueste zuerst
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="tax-optimized" id={`${methodId}-tax-optimized`} />
          <Label htmlFor={`${methodId}-tax-optimized`} className="font-normal cursor-pointer">
            Steueroptimiert - Minimiert Steuerlast
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

function SpreadYearsSection({
  spreadYearsId,
  yearsToSpreadId,
  config,
  onConfigChange,
}: {
  spreadYearsId: string
  yearsToSpreadId: string
  config: SellingStrategyConfig
  onConfigChange: (updates: Partial<SellingStrategyConfig>) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id={spreadYearsId}
            checked={config.spreadOverYears}
            onCheckedChange={(checked) => onConfigChange({ spreadOverYears: checked })}
          />
          <Label htmlFor={spreadYearsId}>Verkauf über mehrere Jahre verteilen</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Nutzen Sie den jährlichen Freibetrag optimal durch Verteilung über mehrere Jahre
        </p>
      </div>

      {config.spreadOverYears && (
        <div className="space-y-2 ml-6">
          <Label htmlFor={yearsToSpreadId}>Anzahl Jahre</Label>
          <Input
            id={yearsToSpreadId}
            type="number"
            value={config.yearsToSpread}
            onChange={(e) => onConfigChange({ yearsToSpread: Number(e.target.value) })}
            min={1}
            max={10}
          />
        </div>
      )}
    </>
  )
}

function ConfigInputs({
  targetAmountId,
  startYearId,
  config,
  onConfigChange,
}: {
  targetAmountId: string
  startYearId: string
  config: SellingStrategyConfig
  onConfigChange: (updates: Partial<SellingStrategyConfig>) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={targetAmountId}>Zu verkaufender Betrag (€)</Label>
        <Input
          id={targetAmountId}
          type="number"
          value={config.targetAmount}
          onChange={(e) => onConfigChange({ targetAmount: Number(e.target.value) })}
          min={1}
          step={1000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={startYearId}>Startjahr</Label>
        <Input
          id={startYearId}
          type="number"
          value={config.startYear}
          onChange={(e) => onConfigChange({ startYear: Number(e.target.value) })}
          min={2000}
          max={2100}
        />
      </div>
    </>
  )
}

export function SellingStrategyConfigForm({
  config,
  onConfigChange,
  showComparison,
  onShowComparisonChange,
}: SellingStrategyConfigFormProps) {
  const methodId = useMemo(() => generateFormId('selling-strategy-form', 'method'), [])
  const targetAmountId = useMemo(() => generateFormId('selling-strategy-form', 'target-amount'), [])
  const spreadYearsId = useMemo(() => generateFormId('selling-strategy-form', 'spread-years'), [])
  const yearsToSpreadId = useMemo(() => generateFormId('selling-strategy-form', 'years-count'), [])
  const startYearId = useMemo(() => generateFormId('selling-strategy-form', 'start-year'), [])

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Konfiguration</h4>

      <MethodSelector
        methodId={methodId}
        value={config.method}
        onChange={(value) => onConfigChange({ method: value as 'fifo' | 'lifo' | 'tax-optimized' })}
      />

      <ConfigInputs
        targetAmountId={targetAmountId}
        startYearId={startYearId}
        config={config}
        onConfigChange={onConfigChange}
      />

      <SpreadYearsSection
        spreadYearsId={spreadYearsId}
        yearsToSpreadId={yearsToSpreadId}
        config={config}
        onConfigChange={onConfigChange}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => onShowComparisonChange(!showComparison)}
        className="w-full"
      >
        {showComparison ? 'Vergleich ausblenden' : 'Methoden vergleichen'}
      </Button>
    </div>
  )
}
