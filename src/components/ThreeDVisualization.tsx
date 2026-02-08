import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Line } from '@react-three/drei'
import { useMemo, useState } from 'react'
import type { ThreeDDataPoint } from '../utils/3d-visualization-data'

/**
 * Props for the ThreeDVisualization component
 */
interface ThreeDVisualizationProps {
  /**
   * Data points to visualize in 3D space
   */
  dataPoints: ThreeDDataPoint[]

  /**
   * Width of the visualization in pixels
   * @default 800
   */
  width?: number

  /**
   * Height of the visualization in pixels
   * @default 600
   */
  height?: number

  /**
   * Whether to show axis labels
   * @default true
   */
  showLabels?: boolean

  /**
   * Whether to color points by return rate
   * @default true
   */
  colorByReturn?: boolean

  /**
   * Whether to show connecting lines between points
   * @default true
   */
  showConnections?: boolean
}

/**
 * Normalizes a value to a range [0, 1] for use in positioning
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5
  return (value - min) / (max - min)
}

/**
 * Converts a return rate to a color (green for positive, red for negative)
 */
function returnToColor(returnRate: number): string {
  if (returnRate > 10) return '#10b981' // Green for high positive returns
  if (returnRate > 5) return '#22c55e' // Light green for moderate positive returns
  if (returnRate > 0) return '#84cc16' // Yellow-green for low positive returns
  if (returnRate > -5) return '#f59e0b' // Orange for low negative returns
  return '#ef4444' // Red for high negative returns
}

/**
 * Calculates data bounds for normalization
 */
function calculateBounds(dataPoints: ThreeDDataPoint[]) {
  if (dataPoints.length === 0) {
    return { minYear: 0, maxYear: 1, minReturn: -10, maxReturn: 10, minCapital: 0, maxCapital: 100000 }
  }

  const years = dataPoints.map((p) => p.year)
  const returns = dataPoints.map((p) => p.returnRate)
  const capitals = dataPoints.map((p) => p.capital)

  return {
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
    minReturn: Math.min(...returns),
    maxReturn: Math.max(...returns),
    minCapital: Math.min(...capitals),
    maxCapital: Math.max(...capitals),
  }
}

/**
 * Converts data points to 3D positions
 */
function convertToPositions(
  dataPoints: ThreeDDataPoint[],
  bounds: ReturnType<typeof calculateBounds>,
  colorByReturn: boolean
) {
  return dataPoints.map((point) => ({
    x: normalize(point.year, bounds.minYear, bounds.maxYear) * 10 - 5, // X: -5 to 5
    y: normalize(point.returnRate, bounds.minReturn, bounds.maxReturn) * 10 - 5, // Y: -5 to 5
    z: normalize(point.capital, bounds.minCapital, bounds.maxCapital) * 10 - 5, // Z: -5 to 5
    color: colorByReturn ? returnToColor(point.returnRate) : '#3b82f6',
    point,
  }))
}

/**
 * Component that renders data points as spheres in 3D space
 */
function DataPoints({
  dataPoints,
  colorByReturn,
  showConnections,
}: {
  dataPoints: ThreeDDataPoint[]
  colorByReturn: boolean
  showConnections: boolean
}) {
  const bounds = useMemo(() => calculateBounds(dataPoints), [dataPoints])
  const positions = useMemo(() => convertToPositions(dataPoints, bounds, colorByReturn), [dataPoints, bounds, colorByReturn])

  return (
    <group>
      {positions.map((pos, index) => (
        <group key={index}>
          <mesh position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={pos.color} />
          </mesh>

          {showConnections && index < positions.length - 1 && (
            <Line
              points={[
                [pos.x, pos.y, pos.z],
                [positions[index + 1].x, positions[index + 1].y, positions[index + 1].z],
              ]}
              color="#94a3b8"
              lineWidth={2}
            />
          )}
        </group>
      ))}
    </group>
  )
}

/**
 * Component that renders axis labels in 3D space
 */
function AxisLabels() {
  return (
    <group>
      {/* X-axis label (Zeit/Year) */}
      <Text position={[0, -6, 0]} fontSize={0.5} color="#64748b" anchorX="center" anchorY="middle">
        Zeit (Jahre)
      </Text>

      {/* Y-axis label (Rendite/Return) */}
      <Text
        position={[-6, 0, 0]}
        fontSize={0.5}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        Rendite (%)
      </Text>

      {/* Z-axis label (Kapital/Capital) */}
      <Text
        position={[0, 0, -6]}
        fontSize={0.5}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
        rotation={[0, -Math.PI / 2, 0]}
      >
        Kapital (€)
      </Text>
    </group>
  )
}

/**
 * Empty state component when no data is available
 */
function EmptyState({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{ width, height }}
      className="flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50"
    >
      <p className="text-gray-500">Keine Daten zur Visualisierung verfügbar</p>
    </div>
  )
}

/**
 * Component that renders the 3D canvas with all visualization elements
 */
function VisualizationCanvas({
  dataPoints,
  showLabels,
  colorByReturn,
  showConnections,
}: {
  dataPoints: ThreeDDataPoint[]
  showLabels: boolean
  colorByReturn: boolean
  showConnections: boolean
}) {
  return (
    <Canvas camera={{ position: [12, 8, 12], fov: 50 }}>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />

      {/* Grid for reference */}
      <Grid args={[10, 10]} cellColor="#94a3b8" sectionColor="#64748b" fadeDistance={50} />

      {/* Data visualization */}
      <DataPoints dataPoints={dataPoints} colorByReturn={colorByReturn} showConnections={showConnections} />

      {/* Axis labels */}
      {showLabels && <AxisLabels />}

      {/* Camera controls */}
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={30} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  )
}

/**
 * ThreeDVisualization - Interactive 3D visualization component
 *
 * Displays financial data in a 3D space with:
 * - X-axis: Time (years)
 * - Y-axis: Return rate (%)
 * - Z-axis: Capital value (€)
 *
 * Features:
 * - Interactive camera controls (orbit, zoom, pan)
 * - Color-coded data points based on return rates
 * - Connecting lines between consecutive time points
 * - Grid and axis labels for orientation
 *
 * @example
 * ```tsx
 * <ThreeDVisualization
 *   dataPoints={simulationData}
 *   width={800}
 *   height={600}
 *   colorByReturn={true}
 *   showConnections={true}
 * />
 * ```
 */
export function ThreeDVisualization({
  dataPoints,
  width = 800,
  height = 600,
  showLabels = true,
  colorByReturn = true,
  showConnections = true,
}: ThreeDVisualizationProps) {
  const [hovered, setHovered] = useState(false)

  if (dataPoints.length === 0) {
    return <EmptyState width={width} height={height} />
  }

  return (
    <div
      style={{ width, height, cursor: hovered ? 'grab' : 'auto' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
    >
      <VisualizationCanvas
        dataPoints={dataPoints}
        showLabels={showLabels}
        colorByReturn={colorByReturn}
        showConnections={showConnections}
      />
    </div>
  )
}
