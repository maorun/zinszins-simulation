import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react'
import { useMemo } from 'react'
import type { SimulationResult } from '../../utils/simulate'
import { formatCurrency } from '../../utils/currency'
import { Slider } from '../ui/slider'
import { useTimelinePlayback } from './useTimelinePlayback'

interface PortfolioTimelineProps {
  simulationData: SimulationResult
  /** Map of year to yearly contribution amount */
  yearlyContributions?: Map<number, number>
  className?: string
  /** Animation speed in milliseconds per year */
  animationSpeed?: number
}

/**
 * Get metrics for a specific year
 */
function getYearMetrics(simulationData: SimulationResult, year: number, yearlyContributions?: Map<number, number>) {
  const yearData = simulationData[year]

  // If no data for this year (e.g., before simulation starts), return zero values
  if (!yearData) {
    return {
      year,
      startkapital: 0,
      endkapital: 0,
      zinsen: 0,
      bezahlteSteuer: 0,
      einzahlungen: yearlyContributions?.get(year) ?? 0,
      rendite: 0,
    }
  }

  // Use provided yearly contribution if available, otherwise calculate from capital difference
  const einzahlungen = yearlyContributions?.get(year) ?? 0

  return {
    year,
    startkapital: yearData.startkapital,
    endkapital: yearData.endkapital,
    zinsen: yearData.zinsen,
    bezahlteSteuer: yearData.bezahlteSteuer,
    einzahlungen,
    rendite: yearData.startkapital > 0 ? (yearData.zinsen / yearData.startkapital) * 100 : 0,
  }
}

/**
 * Playback control buttons component
 */
function PlaybackControls({
  isPlaying,
  currentYear,
  startYear,
  endYear,
  onStepBackward,
  onPlayPause,
  onReset,
  onStepForward,
}: {
  isPlaying: boolean
  currentYear: number
  startYear: number
  endYear: number
  onStepBackward: () => void
  onPlayPause: () => void
  onReset: () => void
  onStepForward: () => void
}) {
  const playPauseLabel = isPlaying ? 'Pausieren' : 'Abspielen'
  const PlayPauseIcon = isPlaying ? Pause : Play

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onStepBackward}
        disabled={currentYear <= startYear}
        aria-label="Ein Jahr zurück"
      >
        <SkipBack className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onPlayPause} aria-label={playPauseLabel}>
        <PlayPauseIcon className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onReset} aria-label="Zurücksetzen">
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onStepForward}
        disabled={currentYear >= endYear}
        aria-label="Ein Jahr vorwärts"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  )
}

/**
 * Timeline slider and progress bar component
 */
function TimelineSlider({
  currentYear,
  startYear,
  endYear,
  progress,
  onSliderChange,
}: {
  currentYear: number
  startYear: number
  endYear: number
  progress: number
  onSliderChange: (value: number[]) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{startYear}</span>
        <span className="font-medium">Jahr {currentYear}</span>
        <span>{endYear}</span>
      </div>
      <Slider
        value={[currentYear]}
        onValueChange={onSliderChange}
        min={startYear}
        max={endYear}
        step={1}
        className="w-full"
      />
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

/**
 * Metrics display grid
 */
function MetricsGrid({ metrics }: { metrics: ReturnType<typeof getYearMetrics> }) {
  if (!metrics) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Startkapital" value={formatCurrency(metrics.startkapital)} />
        <MetricCard label="Endkapital" value={formatCurrency(metrics.endkapital)} />
        <MetricCard label="Zinsen" value={formatCurrency(metrics.zinsen)} positive />
        <MetricCard label="Einzahlungen" value={formatCurrency(metrics.einzahlungen)} />
        <MetricCard label="Rendite" value={`${metrics.rendite.toFixed(2)}%`} positive />
        <MetricCard label="Steuern" value={formatCurrency(metrics.bezahlteSteuer)} negative />
      </div>

      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>Tipp:</strong> Nutzen Sie die Steuerelemente, um die Entwicklung Ihres Portfolios Jahr für Jahr zu
          verfolgen. Die Animation zeigt, wie Einzahlungen, Renditen und Steuern Ihr Kapital beeinflussen.
        </p>
      </div>
    </>
  )
}

/**
 * Info messages component for empty or partial data states
 */
function DataStateMessages({ simulationData, currentYear }: { simulationData: SimulationResult; currentYear: number }) {
  const hasSimulationData = Object.keys(simulationData).length > 0
  const hasDataForCurrentYear = !!simulationData[currentYear]

  if (!hasSimulationData) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          ℹ️ <strong>Keine Simulationsdaten verfügbar.</strong> Erstellen Sie einen Sparplan, um die Portfolio-Animation
          zu sehen.
        </p>
      </div>
    )
  }

  if (!hasDataForCurrentYear) {
    const firstDataYear = Object.keys(simulationData)
      .map(Number)
      .sort((a, b) => a - b)[0]
    return (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs text-blue-800">
          ℹ️ Für das Jahr {currentYear} liegen noch keine Daten vor. Die Simulation beginnt ab Jahr {firstDataYear}.
        </p>
      </div>
    )
  }

  return null
}

/**
 * Portfolio Timeline Animation Component
 *
 * Provides an animated year-by-year visualization of portfolio development
 * with playback controls and key metrics display.
 */
export function PortfolioTimeline({
  simulationData,
  yearlyContributions,
  className = '',
  animationSpeed = 1000,
}: PortfolioTimelineProps) {
  const playback = useTimelinePlayback(simulationData, animationSpeed)
  const { state, progress } = playback

  const currentMetrics = useMemo(
    () => getYearMetrics(simulationData, state.currentYear, yearlyContributions),
    [simulationData, state.currentYear, yearlyContributions],
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎬 Portfolio-Animation
          <span className="text-sm font-normal text-gray-600">Jahr {state.currentYear}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DataStateMessages simulationData={simulationData} currentYear={state.currentYear} />

        <PlaybackControls
          isPlaying={state.isPlaying}
          currentYear={state.currentYear}
          startYear={state.startYear}
          endYear={state.endYear}
          onStepBackward={playback.handleStepBackward}
          onPlayPause={playback.handlePlayPause}
          onReset={playback.handleReset}
          onStepForward={playback.handleStepForward}
        />

        <TimelineSlider
          currentYear={state.currentYear}
          startYear={state.startYear}
          endYear={state.endYear}
          progress={progress}
          onSliderChange={playback.handleSliderChange}
        />

        <MetricsGrid metrics={currentMetrics} />
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}

function MetricCard({ label, value, positive = false, negative = false }: MetricCardProps) {
  const colorClass = positive
    ? 'text-green-700 bg-green-50 border-green-200'
    : negative
      ? 'text-red-700 bg-red-50 border-red-200'
      : 'text-gray-700 bg-gray-50 border-gray-200'

  return (
    <div className={`p-3 rounded border ${colorClass}`}>
      <div className="text-xs font-medium opacity-75 mb-1">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  )
}
