import { useCallback } from 'react'
import {
  refreshBasiszinsFromAPI,
  type BasiszinsConfiguration,
} from '../../services/bundesbank-api'

/**
 * Custom hook for API-related operations
 */
export function useBasiszinsApi(
  basiszinsConfiguration: BasiszinsConfiguration,
  setBasiszinsConfiguration: (config: BasiszinsConfiguration) => void,
  performSimulation: () => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setLastApiUpdate: (update: string | null) => void,
) {
  const handleFetchFromApi = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the new refresh function that properly handles merging
      const updatedConfig = await refreshBasiszinsFromAPI(basiszinsConfiguration)

      setBasiszinsConfiguration(updatedConfig)
      setLastApiUpdate(new Date().toISOString())
      performSimulation()

      // Show success message
      console.log('✅ Basiszins-Daten erfolgreich von der API aktualisiert')
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler beim Abrufen der Daten'
      setError(errorMessage)
      console.error('❌ Fehler beim Aktualisieren der Basiszins-Daten:', errorMessage)
    }
    finally {
      setIsLoading(false)
    }
  }, [basiszinsConfiguration, setBasiszinsConfiguration, performSimulation, setIsLoading, setError, setLastApiUpdate])

  return { handleFetchFromApi }
}
