import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { ChevronDown } from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Brush,
} from 'recharts'
import { formatCurrency } from '../utils/currency'
import type { SimulationResult } from '../utils/simulate'
import { useState } from 'react'

interface ChartDataPoint {
  year: number
  startkapital: number
  endkapital: number
  zinsen: number
  kumulativeEinzahlungen: number
  bezahlteSteuer: number
  // Real values (inflation-adjusted)
  startkapitalReal?: number
  endkapitalReal?: number
  zinsenReal?: number
}

interface InteractiveChartProps {
  simulationData: SimulationResult
  showRealValues?: boolean
  className?: string
}

type ChartView = 'overview' | 'detailed'

/**
 * Convert simulation result to chart data format
 */
function prepareChartData(simulationData: SimulationResult): ChartDataPoint[] {
  const years = Object.keys(simulationData).map(Number).sort((a, b) => a - b)
  let kumulativeEinzahlungen = 0

  return years.map((year) => {
    const yearData = simulationData[year]

    // Calculate cumulative deposits (approximation based on capital progression)
    const previousYear = year - 1
    const previousData = simulationData[previousYear]

    if (previousData) {
      // Estimate new deposits as the difference in starting capital minus previous year's interest
      const newDeposits = yearData.startkapital - (previousData.endkapital || 0)
      kumulativeEinzahlungen += Math.max(0, newDeposits)
    }
    else {
      // First year - starting capital is the first deposit
      kumulativeEinzahlungen = yearData.startkapital
    }

    return {
      year,
      startkapital: yearData.startkapital,
      endkapital: yearData.endkapital,
      zinsen: yearData.zinsen,
      kumulativeEinzahlungen,
      bezahlteSteuer: yearData.bezahlteSteuer,
      startkapitalReal: yearData.startkapitalReal,
      endkapitalReal: yearData.endkapitalReal,
      zinsenReal: yearData.zinsenReal,
    }
  })
}

/**
 * Enhanced tooltip formatter with better formatting and more information
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 min-w-64">
        <p className="font-semibold text-gray-800 text-base mb-2">{`📅 Jahr: ${label}`}</p>

        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">
              {entry.name}
              :
            </span>
            <span
              className="text-sm font-medium ml-2"
              style={{ color: entry.color }}
            >
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}

        {data && (
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Gesamtrendite:</span>
              <span className="font-medium">
                {data.endkapital > data.kumulativeEinzahlungen
                  ? `+${(((data.endkapital / data.kumulativeEinzahlungen) - 1) * 100).toFixed(1)}%`
                  : `${(((data.endkapital / data.kumulativeEinzahlungen) - 1) * 100).toFixed(1)}%`}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

/**
 * Format number for Y-axis display (shorter format for large numbers)
 */
function formatYAxisTick(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`
  }
  else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k €`
  }
  return `${value} €`
}

export function InteractiveChart({
  simulationData,
  showRealValues = false,
  className = '',
}: InteractiveChartProps) {
  const chartData = prepareChartData(simulationData)

  // Interactive state
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(showRealValues)
  const [chartView, setChartView] = useState<ChartView>('overview')
  const [showTaxes, setShowTaxes] = useState(true)

  // Determine which values to show based on showInflationAdjusted state
  const endkapitalKey = showInflationAdjusted ? 'endkapitalReal' : 'endkapital'
  const zinsenKey = showInflationAdjusted ? 'zinsenReal' : 'zinsen'
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Kapitalentwicklung
          {showInflationAdjusted && <span className="text-sm text-gray-600">(inflationsbereinigt)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interactive Controls in Collapsible Section */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              🎛️ Chart-Einstellungen
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="inflation-adjusted"
                  checked={showInflationAdjusted}
                  onCheckedChange={setShowInflationAdjusted}
                />
                <Label htmlFor="inflation-adjusted" className="text-sm">
                  Real (inflationsbereinigt)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-taxes"
                  checked={showTaxes}
                  onCheckedChange={setShowTaxes}
                />
                <Label htmlFor="show-taxes" className="text-sm">
                  Steuern anzeigen
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={chartView === 'overview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('overview')}
                >
                  Übersicht
                </Button>
                <Button
                  variant={chartView === 'detailed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartView('detailed')}
                >
                  Detail
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Chart Container */}
        <div className={`w-full ${chartView === 'detailed' ? 'h-[500px]' : 'h-96'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: chartView === 'detailed' ? 60 : 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="year"
                className="text-xs text-gray-600"
                tick={{ fontSize: 12 }}
                angle={chartView === 'detailed' ? -45 : 0}
                textAnchor={chartView === 'detailed' ? 'end' : 'middle'}
                height={chartView === 'detailed' ? 60 : 30}
              />
              <YAxis
                tickFormatter={formatYAxisTick}
                className="text-xs text-gray-600"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Area for cumulative deposits */}
              <Area
                type="monotone"
                dataKey="kumulativeEinzahlungen"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Kumulierte Einzahlungen"
              />

              {/* Area for total gains/interest */}
              <Area
                type="monotone"
                dataKey={zinsenKey}
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name={showInflationAdjusted ? 'Zinsen/Gewinne (real)' : 'Zinsen/Gewinne'}
              />

              {/* Line for end capital */}
              <Line
                type="monotone"
                dataKey={endkapitalKey}
                stroke="#ef4444"
                strokeWidth={3}
                dot={chartView === 'detailed' ? { fill: '#ef4444', strokeWidth: 2, r: 4 } : false}
                name={showInflationAdjusted ? 'Endkapital (real)' : 'Endkapital'}
              />

              {/* Line for taxes paid - conditional */}
              {showTaxes && (
                <Line
                  type="monotone"
                  dataKey="bezahlteSteuer"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={chartView === 'detailed' ? { fill: '#f59e0b', strokeWidth: 1, r: 2 } : false}
                  name="Bezahlte Steuern"
                />
              )}

              {/* Add zoom/brush functionality for detailed view */}
              {chartView === 'detailed' && chartData.length > 5 && (
                <Brush
                  dataKey="year"
                  height={30}
                  stroke="#8884d8"
                  startIndex={Math.max(0, chartData.length - 10)}
                  endIndex={chartData.length - 1}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Interpretation Guide */}
        <div className="mt-4 text-xs text-gray-600 space-y-2">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-700 mb-2">
              💡
              {' '}
              <strong>Chart-Interpretation:</strong>
            </p>
            <div className="space-y-1">
              <p>
                •
                {' '}
                <span className="text-blue-600 font-medium">Blaue Fläche:</span>
                {' '}
                Ihre kumulierten Einzahlungen über Zeit
              </p>
              <p>
                •
                {' '}
                <span className="text-green-600 font-medium">Grüne Fläche:</span>
                {' '}
                Zinsen und Kapitalgewinne
                {' '}
                {showInflationAdjusted && '(inflationsbereinigt)'}
              </p>
              <p>
                •
                {' '}
                <span className="text-red-600 font-medium">Rote Linie:</span>
                {' '}
                Gesamtes Endkapital
                {' '}
                {showInflationAdjusted && '(inflationsbereinigt)'}
              </p>
              {showTaxes && (
                <p>
                  •
                  {' '}
                  <span className="text-yellow-600 font-medium">Gelbe gestrichelte Linie:</span>
                  {' '}
                  Bezahlte Steuern
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-800 mb-2">
              🎛️
              {' '}
              <strong>Interaktive Funktionen:</strong>
            </p>
            <div className="space-y-1 text-blue-700">
              <p>
                •
                <strong>Real-Werte:</strong>
                {' '}
                Schalter für inflationsbereinigte Darstellung
              </p>
              <p>
                •
                <strong>Steuern:</strong>
                {' '}
                Ein-/Ausblenden der Steuerbelastung
              </p>
              <p>
                •
                <strong>Ansichten:</strong>
                {' '}
                Übersicht oder Detail-Modus mit Zoom
              </p>
              {chartView === 'detailed' && (
                <p>
                  •
                  <strong>Zoom:</strong>
                  {' '}
                  Nutzen Sie den Slider unten für Zeitraum-Auswahl
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InteractiveChart
