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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

let isRegistered = false

/**
 * Register Chart.js components and plugins
 * 
 * This function ensures Chart.js components are registered only once.
 * It registers core components (CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)
 * and the zoom plugin for interactive charts.
 * 
 * The function is idempotent - it can be called multiple times safely.
 * It's automatically called on import to ensure components are available.
 */
export function registerChartComponents() {
  if (!isRegistered) {
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, zoomPlugin)
    isRegistered = true
  }
}

// Auto-register on import
registerChartComponents()
