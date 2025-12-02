import { useState, useMemo } from 'react'
import { Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { TeilverkaufConfiguration } from './TeilverkaufConfiguration'
import { ComparisonSettings } from './ComparisonSettings'
import { ComparisonResultsDisplay } from './ComparisonResultsDisplay'
import {
  createDefaultImmobilienTeilverkaufConfig,
  compareTeilverkaufStrategies,
  type ImmobilienTeilverkaufConfig,
} from '../../../helpers/immobilien-teilverkauf'

export function ImmobilienTeilverkauf() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ImmobilienTeilverkaufConfig>(createDefaultImmobilienTeilverkaufConfig())

  // Calculate comparison results
  const comparisonResult = useMemo(() => {
    if (!config.teilverkauf.enabled) {
      return null
    }

    // Use typical retirement span: age at sale to age 90
    const startAge = config.teilverkauf.saleAge
    const endAge = 90

    return compareTeilverkaufStrategies(config.teilverkauf, config.comparison, startAge, endAge)
  }, [config])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                Immobilien-Teilverkauf mit Nießbrauchrecht
              </CardTitle>
              {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Der Immobilien-Teilverkauf ermöglicht es Ihnen, Liquidität aus Ihrer Immobilie zu generieren, während Sie ein lebenslanges Wohnrecht (Nießbrauch) behalten. Vergleichen Sie diese Option mit
              Vollverkauf + Miete und Leibrente.
            </div>

            <TeilverkaufConfiguration config={config} setConfig={setConfig} />

            {config.teilverkauf.enabled && (
              <>
                <ComparisonSettings config={config} setConfig={setConfig} />

                {comparisonResult && <ComparisonResultsDisplay result={comparisonResult} />}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
