import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { CheckCircle2 } from 'lucide-react'
import type { BeneficiaryAggregate } from '../../../helpers/generational-wealth-transfer'
import { formatCurrency } from '../../utils/currency'

interface BeneficiaryDetailsProps {
  beneficiaries: BeneficiaryAggregate[]
  totalGifted: number
}

function BeneficiaryCard({
  beneficiary,
  totalGifted,
}: {
  beneficiary: BeneficiaryAggregate
  totalGifted: number
}) {
  const percentage = ((beneficiary.totalGross / totalGifted) * 100).toFixed(1)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-lg">{beneficiary.beneficiaryName}</div>
          <div className="text-sm text-muted-foreground">
            {beneficiary.giftsCount} {beneficiary.giftsCount === 1 ? 'Schenkung' : 'Schenkungen'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Anteil</div>
          <div className="font-medium">{percentage}%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground">Bruttobetrag</div>
          <div className="font-medium">{formatCurrency(beneficiary.totalGross)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Steuer</div>
          <div className="font-medium text-red-600">{formatCurrency(beneficiary.totalTax)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Nettobetrag</div>
          <div className="font-medium text-green-600">{formatCurrency(beneficiary.totalNet)}</div>
        </div>
      </div>

      {beneficiary.totalTax === 0 && (
        <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Steuerfrei durch optimale Freibetragsnutzung
        </div>
      )}
    </div>
  )
}

export function BeneficiaryDetails({ beneficiaries, totalGifted }: BeneficiaryDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Detaillierte Vermögensverteilung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {beneficiaries.map((beneficiary) => (
            <BeneficiaryCard
              key={beneficiary.beneficiaryId}
              beneficiary={beneficiary}
              totalGifted={totalGifted}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
