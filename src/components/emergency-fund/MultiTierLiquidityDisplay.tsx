import { getReserveAllocationRecommendation, type ReserveStrategy } from '../../../helpers/emergency-fund'
import { formatCurrency } from '../../utils/currency'
import { Wallet, Landmark, TrendingUp, type LucideIcon } from 'lucide-react'

interface MultiTierLiquidityDisplayProps {
  targetAmount: number
  reserveStrategy: ReserveStrategy
}

interface Tier {
  name: string
  icon: LucideIcon
  description: string
  amount: number
  percentage: number
  return: string
  color: string
  borderColor: string
  bgColor: string
}

function getTiers(targetAmount: number, allocation: { checking: number; savings: number; shortTerm: number }): Tier[] {
  const tier1Amount = (targetAmount * allocation.checking) / 100
  const tier2Amount = (targetAmount * allocation.savings) / 100
  const tier3Amount = (targetAmount * allocation.shortTerm) / 100

  return [
    {
      name: 'Stufe 1: Girokonto',
      icon: Wallet,
      description: 'Sofort verfügbar für tägliche Ausgaben',
      amount: tier1Amount,
      percentage: allocation.checking,
      return: '0%',
      color: 'bg-blue-500',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Stufe 2: Tagesgeldkonto',
      icon: Landmark,
      description: 'Hohe Verfügbarkeit mit aktuellen Tagesgeld-Zinsen',
      amount: tier2Amount,
      percentage: allocation.savings,
      return: '~3-4%',
      color: 'bg-green-500',
      borderColor: 'border-green-300',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Stufe 3: Kurzfristige Anlagen',
      icon: TrendingUp,
      description: 'Geldmarkt-ETF oder kurzfristige Anleihen',
      amount: tier3Amount,
      percentage: allocation.shortTerm,
      return: '~4-5%',
      color: 'bg-purple-500',
      borderColor: 'border-purple-300',
      bgColor: 'bg-purple-50',
    },
  ]
}

function TierCard({ tier }: { tier: Tier }) {
  const Icon = tier.icon
  return (
    <div className={`border ${tier.borderColor} ${tier.bgColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className={`${tier.color} rounded-lg p-2`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-sm text-gray-900 mb-1">{tier.name}</h5>
          <p className="text-xs text-gray-600 mb-2">{tier.description}</p>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(tier.amount)}</p>
            <p className="text-xs text-gray-600">
              {tier.percentage}% • Rendite: {tier.return}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStrategyLabel(strategy: ReserveStrategy): string {
  const labels = {
    conservative: 'Konservativen',
    balanced: 'Ausgewogenen',
    aggressive: 'Aggressiven',
  }
  return labels[strategy]
}

/**
 * Multi-Tier Liquidity Display Component
 * Shows the recommended allocation across different liquidity tiers
 * Implements the three-tier liquidity system from the feature specification
 */
export function MultiTierLiquidityDisplay({ targetAmount, reserveStrategy }: MultiTierLiquidityDisplayProps) {
  const allocation = getReserveAllocationRecommendation(reserveStrategy)
  const tiers = getTiers(targetAmount, allocation)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-gray-900">Empfohlene Liquiditätsaufteilung</h4>
      </div>
      <p className="text-sm text-gray-600">
        Basierend auf Ihrer <strong>{getStrategyLabel(reserveStrategy)}</strong> Strategie empfehlen wir folgende
        Aufteilung Ihres Notgroschens:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, index) => (
          <TierCard key={index} tier={tier} />
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-700">
          <strong>Hinweis:</strong> Die Aufteilung optimiert das Verhältnis zwischen Verfügbarkeit und Rendite. Bei einem{' '}
          <strong>konservativen</strong> Ansatz liegt der Schwerpunkt auf maximaler Liquidität, bei einem{' '}
          <strong>aggressiven</strong> Ansatz auf höherer Rendite bei leicht reduzierter Sofortverfügbarkeit.
        </p>
      </div>
    </div>
  )
}
