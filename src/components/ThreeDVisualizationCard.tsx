import { Suspense, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { ThreeDVisualization } from './ThreeDVisualization'
import { prepareThreeDData } from '../utils/3d-visualization-data'
import type { SimulationResult } from '../utils/simulate'
import { generateUniqueId } from '../utils/unique-id'
import { Box, Info } from 'lucide-react'

/**
 * Props for the ThreeDVisualizationCard component
 */
interface ThreeDVisualizationCardProps {
  /**
   * Simulation results to visualize
   */
  simulationResult?: SimulationResult
}

/**
 * Loading fallback component for 3D visualization
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-96 border border-gray-300 rounded-lg bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Lädt...
          </span>
        </div>
        <p className="mt-4 text-gray-500">3D-Visualisierung wird geladen...</p>
      </div>
    </div>
  )
}

/**
 * Info box explaining how the 3D visualization works
 */
function InfoBox() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex gap-2">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm text-blue-900">
          <p className="font-medium">Wie die 3D-Visualisierung funktioniert:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>X-Achse (horizontal):</strong> Zeitverlauf in Jahren
            </li>
            <li>
              <strong>Y-Achse (vertikal):</strong> Jährliche Rendite in Prozent
            </li>
            <li>
              <strong>Z-Achse (Tiefe):</strong> Kapitalwert in Euro
            </li>
            <li>
              <strong>Steuerung:</strong> Klicken & Ziehen zum Drehen, Mausrad zum Zoomen
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Control switches for visualization settings
 */
function VisualizationControls({
  colorByReturn,
  showConnections,
  showLabels,
  onColorByReturnChange,
  onShowConnectionsChange,
  onShowLabelsChange,
}: {
  colorByReturn: boolean
  showConnections: boolean
  showLabels: boolean
  onColorByReturnChange: (checked: boolean) => void
  onShowConnectionsChange: (checked: boolean) => void
  onShowLabelsChange: (checked: boolean) => void
}) {
  const colorByReturnId = useMemo(() => generateUniqueId('3d-viz', 'color-by-return'), [])
  const showConnectionsId = useMemo(() => generateUniqueId('3d-viz', 'show-connections'), [])
  const showLabelsId = useMemo(() => generateUniqueId('3d-viz', 'show-labels'), [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center space-x-2">
        <Switch id={colorByReturnId} checked={colorByReturn} onCheckedChange={onColorByReturnChange} />
        <Label htmlFor={colorByReturnId} className="cursor-pointer">
          Färbung nach Rendite
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id={showConnectionsId} checked={showConnections} onCheckedChange={onShowConnectionsChange} />
        <Label htmlFor={showConnectionsId} className="cursor-pointer">
          Verbindungslinien
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id={showLabelsId} checked={showLabels} onCheckedChange={onShowLabelsChange} />
        <Label htmlFor={showLabelsId} className="cursor-pointer">
          Achsenbeschriftung
        </Label>
      </div>
    </div>
  )
}

/**
 * Color legend for return rate colors
 */
function ColorLegend() {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Farblegende (Rendite):</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span>&lt; -5%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
          <span>-5% bis 0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#84cc16' }} />
          <span>0% bis 5%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span>5% bis 10%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }} />
          <span>&gt; 10%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state when no data is available
 */
function NoDataMessage() {
  return (
    <div className="flex items-center justify-center h-96 border border-gray-300 rounded-lg bg-gray-50">
      <p className="text-gray-500">
        Keine Simulationsdaten verfügbar. Bitte führen Sie zuerst eine Simulation durch.
      </p>
    </div>
  )
}

/**
 * Main visualization content wrapper
 */
function VisualizationContent({
  dataPoints,
  colorByReturn,
  showConnections,
  showLabels,
}: {
  dataPoints: ReturnType<typeof prepareThreeDData>
  colorByReturn: boolean
  showConnections: boolean
  showLabels: boolean
}) {
  if (dataPoints.length === 0) {
    return <NoDataMessage />
  }

  return (
    <>
      <div className="mt-4">
        <Suspense fallback={<LoadingFallback />}>
          <ThreeDVisualization
            dataPoints={dataPoints}
            width={800}
            height={600}
            showLabels={showLabels}
            colorByReturn={colorByReturn}
            showConnections={showConnections}
          />
        </Suspense>
      </div>
      {colorByReturn && <ColorLegend />}
    </>
  )
}

/**
 * ThreeDVisualizationCard - Card component for 3D visualization
 *
 * Displays simulation data in an interactive 3D space showing:
 * - Time progression (X-axis)
 * - Return rates (Y-axis)
 * - Capital development (Z-axis)
 *
 * Features:
 * - Interactive 3D controls (rotate, zoom, pan)
 * - Color-coded by return rate
 * - Connecting lines between time points
 * - Toggle options for labels and connections
 *
 * @example
 * ```tsx
 * <ThreeDVisualizationCard simulationResult={simulationData} />
 * ```
 */
export function ThreeDVisualizationCard({ simulationResult }: ThreeDVisualizationCardProps) {
  const [colorByReturn, setColorByReturn] = React.useState(true)
  const [showConnections, setShowConnections] = React.useState(true)
  const [showLabels, setShowLabels] = React.useState(true)

  const dataPoints = useMemo(() => {
    if (!simulationResult) return []
    return prepareThreeDData(simulationResult, { normalizeCapital: false })
  }, [simulationResult])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          3D-Visualisierung: Zeit-Rendite-Kapital
        </CardTitle>
        <CardDescription>
          Interaktive dreidimensionale Darstellung der Kapitalentwicklung im Zeitverlauf
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoBox />
        <VisualizationControls
          colorByReturn={colorByReturn}
          showConnections={showConnections}
          showLabels={showLabels}
          onColorByReturnChange={setColorByReturn}
          onShowConnectionsChange={setShowConnections}
          onShowLabelsChange={setShowLabels}
        />
        <VisualizationContent
          dataPoints={dataPoints}
          colorByReturn={colorByReturn}
          showConnections={showConnections}
          showLabels={showLabels}
        />
      </CardContent>
    </Card>
  )
}

// Import React for useState
import * as React from 'react'
