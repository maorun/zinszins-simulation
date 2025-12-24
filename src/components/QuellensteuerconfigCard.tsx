import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { QuellensteuerconfigurationSection } from './QuellensteuerconfigurationSection'
import { createDefaultQuellensteuerconfigConfiguration } from '../../helpers/quellensteuer'

/**
 * Quellensteueranrechnung (Foreign Withholding Tax Credit) Information Card
 *
 * This is an informational/educational tool that helps users understand
 * how foreign withholding taxes can be credited against German capital gains tax.
 *
 * Similar to TaxLossHarvestingCard and TailRiskHedgingCard, this is a standalone
 * informational tool that doesn't integrate with the main simulation state.
 */
export function QuellensteuerconfigCard() {
  const defaultConfig = createDefaultQuellensteuerconfigConfiguration()
  const [config, setConfig] = useState(defaultConfig)

  // German capital gains tax rate (25% + 5.5% Soli)
  const germanCapitalGainsTaxRate = 0.26375

  // Default: No Teilfreistellung (user can mentally adjust for equity funds)
  const teilfreistellung = 0

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🌍 Quellensteueranrechnung (Informations-Tool)
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <QuellensteuerconfigurationSection
              enabled={config.enabled}
              foreignIncome={config.foreignIncome}
              withholdingTaxRate={config.withholdingTaxRate}
              countryCode={config.countryCode}
              germanCapitalGainsTaxRate={germanCapitalGainsTaxRate}
              teilfreistellung={teilfreistellung}
              onEnabledChange={enabled => setConfig({ ...config, enabled })}
              onForeignIncomeChange={amount => setConfig({ ...config, foreignIncome: amount })}
              onWithholdingTaxRateChange={rate => setConfig({ ...config, withholdingTaxRate: rate })}
              onCountryCodeChange={code => setConfig({ ...config, countryCode: code })}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
