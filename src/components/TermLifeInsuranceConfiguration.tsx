import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  type TermLifeInsuranceConfig,
  createDefaultTermLifeInsuranceConfig,
} from '../../helpers/term-life-insurance'
import { generateFormId } from '../utils/unique-id'

interface TermLifeInsuranceConfigurationProps {
  /** Current term life insurance configuration */
  config: TermLifeInsuranceConfig | null
  /** Callback when configuration changes */
  onChange: (config: TermLifeInsuranceConfig | null) => void
  /** Current year for validation */
  currentYear?: number
  /** Birth year for calculations */
  birthYear?: number
  /** Planning mode */
  planningMode: 'individual' | 'couple'
}

function createConfigWithBirthYear(birthYear: number | undefined, currentYear: number): TermLifeInsuranceConfig {
  const defaultConfig = createDefaultTermLifeInsuranceConfig()
  if (birthYear) {
    defaultConfig.birthYear = birthYear
    defaultConfig.startYear = currentYear
    defaultConfig.endYear = currentYear + 20
  }
  defaultConfig.enabled = true
  return defaultConfig
}

function EnableToggle({
  isEnabled,
  enabledSwitchId,
  onEnabledChange,
}: {
  isEnabled: boolean
  enabledSwitchId: string
  onEnabledChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={enabledSwitchId} className="flex flex-col gap-1">
        <span className="font-medium">Risikolebensversicherung aktivieren</span>
        <span className="text-sm text-muted-foreground">Absicherung von Hinterbliebenen im Todesfall</span>
      </Label>
      <Switch id={enabledSwitchId} checked={isEnabled} onCheckedChange={onEnabledChange} />
    </div>
  )
}

function ConfigurationContent({
  birthYear,
  currentYear,
  planningMode,
  onChange,
}: {
  birthYear: number | undefined
  currentYear: number
  planningMode: 'individual' | 'couple'
  onChange: (config: TermLifeInsuranceConfig) => void
}) {
  return (
    <>
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-4">
          Die Risikolebensversicherung bietet reinen Todesfallschutz ohne Sparanteil. Leistungen sind steuerfrei (§ 20
          Abs. 1 Nr. 6 EStG).
        </p>
      </div>

      <div className="pt-4 border-t">
        <Button variant="outline" size="sm" onClick={() => onChange(createConfigWithBirthYear(birthYear, currentYear))}>
          Auf Standardwerte zurücksetzen
        </Button>
      </div>

      {planningMode === 'couple' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-900">
            <strong>Hinweis für Ehepaare:</strong> Für umfassenden Schutz sollten beide Partner separat versichert
            werden. Die aktuelle Konfiguration gilt für eine Person.
          </p>
        </div>
      )}
    </>
  )
}

/**
 * Term life insurance configuration component
 */
export function TermLifeInsuranceConfiguration({
  config,
  onChange,
  currentYear = new Date().getFullYear(),
  birthYear,
  planningMode,
}: TermLifeInsuranceConfigurationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const enabledSwitchId = useMemo(() => generateFormId('term-life-insurance', 'enabled'), [])
  const isEnabled = config?.enabled ?? false

  const handleEnabledChange = (enabled: boolean) => {
    if (enabled && !config) {
      onChange(createConfigWithBirthYear(birthYear, currentYear))
    } else if (!enabled && config) {
      onChange({ ...config, enabled: false })
    } else if (enabled && config) {
      onChange({ ...config, enabled: true })
    }
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="flex items-center gap-2">
                <span>💼</span>
                <span>Risikolebensversicherung (Term Life Insurance)</span>
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <EnableToggle isEnabled={isEnabled} enabledSwitchId={enabledSwitchId} onEnabledChange={handleEnabledChange} />
            {isEnabled && config && (
              <ConfigurationContent
                birthYear={birthYear}
                currentYear={currentYear}
                planningMode={planningMode}
                onChange={onChange}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

