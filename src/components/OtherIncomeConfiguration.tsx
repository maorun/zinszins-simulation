import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { ChevronDown, Plus } from 'lucide-react'
import {
  type OtherIncomeConfiguration,
  type OtherIncomeSource,
  createDefaultOtherIncomeSource,
} from '../../helpers/other-income'
import { toast } from 'sonner'
import { OtherIncomeSourceFormEditor } from './other-income/OtherIncomeSourceFormEditor'
import { OtherIncomeSourceList } from './other-income/OtherIncomeSourceList'

interface OtherIncomeConfigurationProps {
  config: OtherIncomeConfiguration
  onChange: (config: OtherIncomeConfiguration) => void
}

export function OtherIncomeConfigurationComponent({
  config,
  onChange,
}: OtherIncomeConfigurationProps) {
  const [editingSource, setEditingSource] = useState<OtherIncomeSource | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const handleConfigChange = (updates: Partial<OtherIncomeConfiguration>) => {
    onChange({ ...config, ...updates })
  }

  const handleSourceChange = (sourceId: string, updates: Partial<OtherIncomeSource>) => {
    const updatedSources = config.sources.map(source =>
      source.id === sourceId ? { ...source, ...updates } : source,
    )
    handleConfigChange({ sources: updatedSources })
  }

  const handleAddSource = () => {
    const newSource = createDefaultOtherIncomeSource('rental')
    setEditingSource(newSource)
    setIsAddingNew(true)
  }

  const handleSaveSource = () => {
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

  const handleCancelEdit = () => {
    setEditingSource(null)
    setIsAddingNew(false)
  }

  const handleDeleteSource = (sourceId: string) => {
    const updatedSources = config.sources.filter(source => source.id !== sourceId)
    handleConfigChange({ sources: updatedSources })
    toast.success('Einkommensquelle erfolgreich entfernt!')
  }

  const handleEditSource = (source: OtherIncomeSource) => {
    setEditingSource({ ...source })
    setIsAddingNew(false)
  }

  const handleUpdateEditingSource = (source: OtherIncomeSource) => {
    setEditingSource(source)
  }

  return (
    <Card className="mb-6">
      <Collapsible defaultOpen={false}>
        <CardHeader className="pb-4">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                💰 Andere Einkünfte
              </CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Hier können Sie zusätzliche Einkünfte wie Mieteinnahmen, private Renten oder
                Gewerbeeinkünfte hinzufügen. Diese werden in der Entnahmephase als zusätzliches
                Einkommen berücksichtigt und können die notwendigen Entnahmen aus dem Portfolio reduzieren.
              </p>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="other-income-enabled" className="text-base font-medium">
                  Andere Einkünfte aktivieren
                </Label>
                <Switch
                  id="other-income-enabled"
                  checked={config.enabled}
                  onCheckedChange={enabled => handleConfigChange({ enabled })}
                />
              </div>
              <p className="text-sm text-gray-600">
                Aktivieren Sie diese Option, um zusätzliche Einkommensquellen zu berücksichtigen.
              </p>
            </div>

            {config.enabled && (
              <>
                {/* Add New Source Button */}
                <div className="mb-6">
                  <Button
                    onClick={handleAddSource}
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={editingSource !== null}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Einkommensquelle hinzufügen
                  </Button>
                </div>

                {/* Edit/Add Source Form */}
                {editingSource && (
                  <OtherIncomeSourceFormEditor
                    editingSource={editingSource}
                    isAddingNew={isAddingNew}
                    onUpdate={handleUpdateEditingSource}
                    onSave={handleSaveSource}
                    onCancel={handleCancelEdit}
                  />
                )}

                {/* Existing Sources List */}
                <OtherIncomeSourceList
                  sources={config.sources}
                  onSourceChange={handleSourceChange}
                  onEditSource={handleEditSource}
                  onDeleteSource={handleDeleteSource}
                  editingSource={editingSource}
                />

                {config.sources.length === 0 && !editingSource && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Noch keine Einkommensquellen konfiguriert.</p>
                    <p className="text-sm">Klicken Sie oben auf "Neue Einkommensquelle hinzufügen" um zu beginnen.</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
