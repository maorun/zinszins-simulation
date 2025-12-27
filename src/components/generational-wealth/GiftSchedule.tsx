import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { GenerationalGiftResult } from '../../../helpers/generational-wealth-transfer'
import { formatCurrency } from '../../utils/currency'

interface GiftScheduleProps {
  gifts: GenerationalGiftResult[]
}

export function GiftSchedule({ gifts }: GiftScheduleProps) {
  const sortedGifts = [...gifts].sort((a, b) => a.gift.year - b.gift.year)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Zeitplan der Schenkungen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedGifts.map((giftResult, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <div className="flex-1">
                <div className="font-medium">{giftResult.beneficiaryName}</div>
                <div className="text-sm text-muted-foreground">
                  {giftResult.gift.description || 'Schenkung'}
                </div>
              </div>
              <div className="text-center px-4">
                <div className="text-sm text-muted-foreground">Jahr</div>
                <div className="font-medium">{giftResult.gift.year}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(giftResult.gift.amount)}</div>
                {giftResult.tax > 0 && (
                  <div className="text-sm text-red-600">
                    Steuer: {formatCurrency(giftResult.tax)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
