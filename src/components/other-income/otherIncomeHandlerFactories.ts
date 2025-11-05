import { toast } from 'sonner'
import { type OtherIncomeConfiguration, type OtherIncomeSource } from '../../../helpers/other-income'

export function createConfigUpdater(
  config: OtherIncomeConfiguration,
  onChange: (config: OtherIncomeConfiguration) => void,
) {
  return (updates: Partial<OtherIncomeConfiguration>) => {
    onChange({ ...config, ...updates })
  }
}

export function createSourceUpdater(
  config: OtherIncomeConfiguration,
  handleConfigChange: (updates: Partial<OtherIncomeConfiguration>) => void,
) {
  return (sourceId: string, updates: Partial<OtherIncomeSource>) => {
    const updatedSources = config.sources.map(source =>
      source.id === sourceId ? { ...source, ...updates } : source,
    )
    handleConfigChange({ sources: updatedSources })
  }
}

export function createSourceSaver(
  editingSource: OtherIncomeSource | null,
  isAddingNew: boolean,
  config: OtherIncomeConfiguration,
  handleConfigChange: (updates: Partial<OtherIncomeConfiguration>) => void,
  handleSourceChange: (sourceId: string, updates: Partial<OtherIncomeSource>) => void,
  setEditingSource: (source: OtherIncomeSource | null) => void,
  setIsAddingNew: (value: boolean) => void,
) {
  return () => {
    if (!editingSource) return

    if (isAddingNew) {
      handleConfigChange({
        sources: [...config.sources, editingSource],
      })
      toast.success('Einkommensquelle erfolgreich hinzugefügt!')
    }
    else {
      handleSourceChange(editingSource.id, editingSource)
      toast.success('Einkommensquelle erfolgreich aktualisiert!')
    }

    setEditingSource(null)
    setIsAddingNew(false)
  }
}

export function createSourceDeleter(
  config: OtherIncomeConfiguration,
  handleConfigChange: (updates: Partial<OtherIncomeConfiguration>) => void,
) {
  return (sourceId: string) => {
    const updatedSources = config.sources.filter(source => source.id !== sourceId)
    handleConfigChange({ sources: updatedSources })
    toast.success('Einkommensquelle erfolgreich entfernt!')
  }
}
