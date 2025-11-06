import { useCallback, useState } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { copyParametersToClipboard } from '../utils/parameter-export'

export interface ParameterExportState {
  isExporting: boolean
  lastExportResult: 'success' | 'error' | null
}

/**
 * Custom hook for exporting simulation parameters to clipboard
 */
export function useParameterExport() {
  const context = useSimulation()
  const [state, setState] = useState<ParameterExportState>({
    isExporting: false,
    lastExportResult: null,
  })

  const exportParameters = useCallback(async () => {
    setState(prev => ({ ...prev, isExporting: true, lastExportResult: null }))

    try {
      const success = await copyParametersToClipboard(context)
      setState({
        isExporting: false,
        lastExportResult: success ? 'success' : 'error',
      })

      // Clear the result after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, lastExportResult: null }))
      }, 3000)

      return success
    } catch (_error) {
      setState({
        isExporting: false,
        lastExportResult: 'error',
      })

      // Clear the result after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, lastExportResult: null }))
      }, 3000)

      return false
    }
  }, [context])

  return {
    exportParameters,
    ...state,
  }
}
