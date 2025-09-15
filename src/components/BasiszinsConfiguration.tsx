import { useCallback, useState } from 'react'
import { Download, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import {
  estimateFutureBasiszins,
  refreshBasiszinsFromAPI,
  validateBasiszinsRate,
  type BasiszinsData,
} from '../services/bundesbank-api'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

/**
 * Basiszins Configuration Component
 * Manages interest rates from Deutsche Bundesbank for Vorabpauschale calculation
 */
export default function BasiszinsConfiguration() {
  const {
    basiszinsConfiguration,
    setBasiszinsConfiguration,
    performSimulation,
  } = useSimulation()

  const [isLoading, setIsLoading] = useState(false)
  const [lastApiUpdate, setLastApiUpdate] = useState<string | null>(null)
  const [newYear, setNewYear] = useState('')
  const [newRate, setNewRate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()

  /**
   * Fetch latest rates from Deutsche Bundesbank API
   */
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
  }, [basiszinsConfiguration, setBasiszinsConfiguration, performSimulation])

  /**
   * Add manual entry for a specific year
   */
  const handleAddManualEntry = useCallback(() => {
    const year = parseInt(newYear)
    const rate = parseFloat(newRate) / 100 // Convert percentage to decimal

    if (isNaN(year) || year < 2018 || year > 2050) {
      setError('Bitte geben Sie ein gültiges Jahr zwischen 2018 und 2050 ein.')
      return
    }

    if (isNaN(rate) || !validateBasiszinsRate(rate)) {
      setError('Bitte geben Sie einen gültigen Zinssatz zwischen -2% und 10% ein.')
      return
    }

    const newEntry: BasiszinsData = {
      year,
      rate,
      source: 'manual',
      lastUpdated: new Date().toISOString(),
    }

    setBasiszinsConfiguration({
      ...basiszinsConfiguration,
      [year]: newEntry,
    })

    setNewYear('')
    setNewRate('')
    setError(null)
    performSimulation()
  }, [newYear, newRate, basiszinsConfiguration, setBasiszinsConfiguration, performSimulation])

  /**
   * Remove a year from configuration
   */
  const handleRemoveYear = useCallback((year: number) => {
    const updatedConfig = { ...basiszinsConfiguration }
    delete updatedConfig[year]
    setBasiszinsConfiguration(updatedConfig)
    performSimulation()
  }, [basiszinsConfiguration, setBasiszinsConfiguration, performSimulation])

  /**
   * Update rate for existing year
   */
  const handleUpdateRate = useCallback((year: number, newRateValue: string) => {
    const rate = parseFloat(newRateValue) / 100 // Convert percentage to decimal

    if (isNaN(rate) || !validateBasiszinsRate(rate)) {
      return // Invalid rate, don't update
    }

    const updatedEntry: BasiszinsData = {
      ...basiszinsConfiguration[year],
      rate,
      source: 'manual', // Mark as manually edited
      lastUpdated: new Date().toISOString(),
    }

    setBasiszinsConfiguration({
      ...basiszinsConfiguration,
      [year]: updatedEntry,
    })

    performSimulation()
  }, [basiszinsConfiguration, setBasiszinsConfiguration, performSimulation])

  /**
   * Suggest rate for future years
   */
  const getSuggestedRate = useCallback(() => {
    const estimate = estimateFutureBasiszins(basiszinsConfiguration)
    return (estimate * 100).toFixed(2) // Convert to percentage
  }, [basiszinsConfiguration])

  // Sort years for display
  const sortedYears = Object.keys(basiszinsConfiguration)
    .map(Number)
    .sort((a, b) => b - a) // Newest first

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>📈 Basiszins-Konfiguration (Deutsche Bundesbank)</CollapsibleCardHeader>
      <CollapsibleCardContent>

        {/* Information Panel */}
        <Alert>
          <AlertDescription>
            Der Basiszins wird zur Berechnung der Vorabpauschale verwendet.
            Die offiziellen Sätze werden jährlich vom Bundesfinanzministerium
            basierend auf Bundesbank-Daten veröffentlicht.
          </AlertDescription>
        </Alert>

        {/* API Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleFetchFromApi}
            disabled={isLoading}
          >
            {isLoading
              ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                )
              : (
                  <Download className="h-4 w-4 mr-2" />
                )}
            Von Bundesbank aktualisieren
          </Button>

          {lastApiUpdate && (
            <div className="text-sm text-muted-foreground self-center">
              Zuletzt aktualisiert:
              {' '}
              {new Date(lastApiUpdate).toLocaleDateString('de-DE')}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Manual Entry Form */}
        <div className="space-y-4">
          <Label>Manueller Eintrag für zukünftige Jahre</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Jahr"
              value={newYear}
              min={currentYear}
              max={2050}
              onChange={e => setNewYear(e.target.value)}
            />
            <Input
              type="number"
              placeholder={`Zinssatz (%) - Vorschlag: ${getSuggestedRate()}%`}
              value={newRate}
              min={-2}
              max={10}
              step={0.01}
              onChange={e => setNewRate(e.target.value)}
            />
            <Button onClick={handleAddManualEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </div>

        {/* Rates Table */}
        <div className="border rounded-md max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Jahr</TableHead>
                <TableHead className="text-center">Basiszins (%)</TableHead>
                <TableHead className="text-center">Quelle</TableHead>
                <TableHead className="text-center">Zuletzt aktualisiert</TableHead>
                <TableHead className="text-center">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedYears.map((year) => {
                const data = basiszinsConfiguration[year]
                return (
                  <TableRow key={year}>
                    <TableCell className="text-center font-medium">{year}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        value={(data.rate * 100).toFixed(2)}
                        min={-2}
                        max={10}
                        step={0.01}
                        onChange={e => handleUpdateRate(year, e.target.value)}
                        className="w-20 mx-auto text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        data.source === 'api'
                          ? 'bg-green-100 text-green-800'
                          : data.source === 'manual'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                      >
                        {data.source === 'api'
                          ? '🏛️ API'
                          : data.source === 'manual' ? '✏️ Manuell' : '📋 Standard'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {data.lastUpdated
                        ? new Date(data.lastUpdated).toLocaleDateString('de-DE')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveYear(year)}
                        disabled={year <= currentYear - 1} // Prevent deletion of historical data
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary Info */}
        <div className="text-sm text-muted-foreground">
          <p>
            💡
            {' '}
            <strong>Tipp:</strong>
            {' '}
            Historische Daten (vor
            {' '}
            {currentYear}
            ) können nicht gelöscht werden.
            Zukünftige Raten können manuell hinzugefügt oder über die Bundesbank-API aktualisiert werden.
          </p>
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
