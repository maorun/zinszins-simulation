/**
 * Chart.js setup and registration
 * This file ensures Chart.js components are registered only once
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

let isRegistered = false

export function registerChartComponents() {
  if (!isRegistered) {
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin)
    isRegistered = true
  }
}

// Auto-register on import
registerChartComponents()
