import { HandCoins } from 'lucide-react'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { CardDescription } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { AlimonyPaymentForm } from './alimony/AlimonyPaymentForm'
import { useAlimony } from './alimony/useAlimony'
import { useMemo } from 'react'
import { generateFormId } from '../utils/unique-id'

function AlimonyHeader() {
  return (
    <CollapsibleCardHeader titleClassName="text-lg sm:text-xl font-bold flex items-center gap-2">
      <HandCoins className="w-5 h-5 sm:w-6 sm:h-6" />
      Unterhaltszahlungen
    </CollapsibleCardHeader>
  )
}

/**
 * Alimony Configuration Component
 * Allows users to configure child support and spousal alimony payments
 */
export default function AlimonyConfiguration() {
  const { config, handleToggleEnabled, handleAddPayment, handleUpdatePayment, handleRemovePayment } = useAlimony()

  const enabledSwitchId = useMemo(() => generateFormId('alimony', 'enabled'), [])

  return (
    <CollapsibleCard>
      <AlimonyHeader />
      <CollapsibleCardContent>
        <div className="space-y-6">
          <CardDescription>
            Kindesunterhalt, Ehegattenunterhalt und Trennungsunterhalt planen
          </CardDescription>

          <div className="flex items-center space-x-2">
            <Switch id={enabledSwitchId} checked={config.enabled} onCheckedChange={handleToggleEnabled} />
            <Label htmlFor={enabledSwitchId}>Unterhaltszahlungen aktivieren</Label>
          </div>

          {config.enabled && (
            <>
              {config.payments.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-gray-600 mb-4">Noch keine Unterhaltszahlungen konfiguriert</p>
                  <Button onClick={handleAddPayment}>Erste Zahlung hinzufügen</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.payments.map((payment, index) => (
                    <AlimonyPaymentForm
                      key={index}
                      payment={payment}
                      index={index}
                      onUpdate={handleUpdatePayment}
                      onRemove={handleRemovePayment}
                    />
                  ))}
                  <Button onClick={handleAddPayment} variant="outline" className="w-full">
                    Weitere Zahlung hinzufügen
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
