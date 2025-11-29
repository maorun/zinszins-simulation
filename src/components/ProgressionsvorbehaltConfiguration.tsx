import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import type { ProgressionsvorbehaltConfig } from '../../helpers/progressionsvorbehalt'
import { GlossaryTerm } from './GlossaryTerm'
import { ProgressionsvorbehaltContent } from './progressionsvorbehalt/ProgressionsvorbehaltContent'

interface ProgressionsvorbehaltConfigurationProps {
  config: ProgressionsvorbehaltConfig
  onChange: (config: ProgressionsvorbehaltConfig) => void
  planningMode?: 'individual' | 'couple'
  kirchensteuerAktiv?: boolean
  kirchensteuersatz?: number
  timeRange?: { start: number; end: number }
}

export function ProgressionsvorbehaltConfiguration({
  config,
  onChange,
  kirchensteuerAktiv = false,
  kirchensteuersatz = 9,
  timeRange,
}: ProgressionsvorbehaltConfigurationProps) {
  const handleToggle = (checked: boolean) => {
    onChange({ ...config, enabled: checked })
  }

  return (
    <Card nestingLevel={1}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            📊 Progressionsvorbehalt
            <GlossaryTerm term="progressionsvorbehalt" showIcon />
          </span>
          <div className="flex items-center gap-2">
            <Switch
              id="progressionsvorbehalt-enabled"
              checked={config.enabled}
              onCheckedChange={handleToggle}
              aria-label="Progressionsvorbehalt aktivieren"
            />
            <Label htmlFor="progressionsvorbehalt-enabled" className="cursor-pointer text-sm font-normal">
              {config.enabled ? 'Aktiviert' : 'Deaktiviert'}
            </Label>
          </div>
        </CardTitle>
      </CardHeader>

      {config.enabled && (
        <CardContent>
          <ProgressionsvorbehaltContent
            config={config}
            onChange={onChange}
            kirchensteuerAktiv={kirchensteuerAktiv}
            kirchensteuersatz={kirchensteuersatz}
            timeRange={timeRange}
          />
        </CardContent>
      )}
    </Card>
  )
}
