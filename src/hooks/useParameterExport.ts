import { useCallback, useState } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { createParameterExport, copyParametersToClipboard, parseParameterImport } from '../utils/parameter-export'
import { loadAllConfigurations } from '../contexts/hooks/config/loadConfigurationHelpers'
import { createDefaultConfiguration } from '../contexts/helpers/default-config'

export interface ParameterExportState {
  isExporting: boolean
  lastExportResult: 'success' | 'error' | null
}

function downloadParameterFile(context: ReturnType<typeof useSimulation>) {
  const blob = new Blob([JSON.stringify(createParameterExport(context), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'zinszins-simulation-parameter.json'
  link.click()
  URL.revokeObjectURL(url)
}

async function loadParameterFile(file: File, context: ReturnType<typeof useSimulation>) {
  const configuration = parseParameterImport(await file.text())
  loadAllConfigurations(configuration, createDefaultConfiguration(), context)
  await context.performSimulation()
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

  const exportParametersFile = useCallback(() => {
    downloadParameterFile(context)
  }, [context])

  const importParametersFile = useCallback(async (file: File) => {
    try {
      await loadParameterFile(file, context)
      return true
    } catch {
      return false
    }
  }, [context])

  return {
    exportParameters,
    exportParametersFile,
    importParametersFile,
    ...state,
  }
}
