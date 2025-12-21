import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  type CareInsuranceConfig,
  createDefaultCareInsuranceConfig,
} from '../../helpers/care-insurance'
import { generateFormId } from '../utils/unique-id'

interface CareInsuranceConfigurationProps {
  /** Current care insurance configuration */
  config: CareInsuranceConfig | null
  /** Callback when configuration changes */
  onChange: (config: CareInsuranceConfig | null) => void
  /** Current year for validation */
  currentYear?: number
  /** Birth year for calculations */
  birthYear?: number
  /** Planning mode */
  planningMode: 'individual' | 'couple'
}

function createConfigWithBirthYear(birthYear: number | undefined, currentYear: number): CareInsuranceConfig {
  const defaultConfig = createDefaultCareInsuranceConfig()
  if (birthYear) {
    defaultConfig.birthYear = birthYear
    defaultConfig.startYear = currentYear
    defaultConfig.endYear = currentYear + 40 // Until age 85
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
        <span className="font-medium">Pflegezusatzversicherung aktivieren</span>
        <span className="text-sm text-muted-foreground">
          Zusätzliche Absicherung bei Pflegebedürftigkeit
        </span>
      </Label>
      <Switch id={enabledSwitchId} checked={isEnabled} onCheckedChange={onEnabledChange} />
    </div>
  )
}

function InfoSection() {
  return (
    <div className="pt-4 border-t">
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Die Pflegezusatzversicherung ergänzt die gesetzliche Pflegeversicherung und schließt die Versorgungslücke
          bei Pflegebedürftigkeit.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-900">
            <strong>Wichtig:</strong> Die gesetzliche Pflegeversicherung deckt typischerweise nur 50-70% der
            tatsächlichen Pflegekosten. Bei Pflegegrad 5 können monatliche Kosten von 2.000-4.500 € entstehen.
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Pflege-Bahr:</strong> Staatlich geförderte Pflegezusatzversicherung mit 5 €/Monat Zuschuss (60
            €/Jahr) bei mind. 10 € Monatsbeitrag.
          </p>
          <p>
            <strong>Leistungen:</strong> Steuerfreie Pflegeleistungen nach § 3 Nr. 1a EStG, gestaffelt nach
            Pflegegrad 1-5.
          </p>
        </div>
      </div>
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
  onChange: (config: CareInsuranceConfig) => void
}) {
  return (
    <>
      <InfoSection />

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
 * Care insurance configuration component
 */
export function CareInsuranceConfiguration({
  config,
  onChange,
  currentYear = new Date().getFullYear(),
  birthYear,
  planningMode,
}: CareInsuranceConfigurationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const enabledSwitchId = useMemo(() => generateFormId('care-insurance', 'enabled'), [])
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
                <span>🏥</span>
                <span>Pflegezusatzversicherung (Long-term Care Insurance)</span>
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
