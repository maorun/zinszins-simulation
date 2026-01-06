/**
 * ScenarioManagement Component
 * Allows users to save and load their financial planning scenarios
 */

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, Save, FileText, Trash2, Download } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { useScenarioManagement } from '../hooks/useScenarioManagement'
import { useScenarioHandlers } from '../hooks/useScenarioHandlers'
import { useNavigationItem } from '../hooks/useNavigationItem'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import type { SavedScenario } from '../types/scenario-comparison'

interface ScenarioManagementProps {
  currentConfiguration: ExtendedSavedConfiguration
  onLoadScenario: (configuration: ExtendedSavedConfiguration) => void
}

interface ScenarioSaveFormProps {
  scenarioName: string
  scenarioDescription: string
  saveSuccess: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSave: () => void
}

function ScenarioSaveForm({
  scenarioName,
  scenarioDescription,
  saveSuccess,
  onNameChange,
  onDescriptionChange,
  onSave,
}: ScenarioSaveFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Aktuelle Konfiguration speichern</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="scenario-name">Szenario-Name *</Label>
          <Input
            id="scenario-name"
            value={scenarioName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="z.B. Konservative Strategie"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="scenario-description">Beschreibung (optional)</Label>
          <Input
            id="scenario-description"
            value={scenarioDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Kurze Beschreibung des Szenarios"
            className="mt-1"
          />
        </div>
        <Button
          onClick={onSave}
          disabled={!scenarioName.trim()}
          variant={saveSuccess ? 'secondary' : 'default'}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveSuccess ? '✓ Gespeichert!' : 'Szenario speichern'}
        </Button>
      </div>
    </div>
  )
}

interface ScenarioListProps {
  scenarios: SavedScenario[]
  onLoad: (configuration: ExtendedSavedConfiguration) => void
  onDelete: (id: string) => void
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface ScenarioItemProps {
  scenario: SavedScenario
  onLoad: (configuration: ExtendedSavedConfiguration) => void
  onDelete: (id: string) => void
}

function ScenarioItem({ scenario, onLoad, onDelete }: ScenarioItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <div className="font-medium text-gray-900">{scenario.name}</div>
        {scenario.description && (
          <div className="text-sm text-gray-600 mt-1">{scenario.description}</div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          Gespeichert am {formatDate(scenario.createdAt)}
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          onClick={() => onLoad(scenario.configuration)}
          size="sm"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-1" />
          Laden
        </Button>
        <Button
          onClick={() => onDelete(scenario.id)}
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ScenarioList({ scenarios, onLoad, onDelete }: ScenarioListProps) {
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Noch keine Szenarien gespeichert</p>
        <p className="text-sm mt-1">Speichern Sie Ihre aktuelle Konfiguration, um sie später wieder zu laden</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Gespeicherte Szenarien</h3>
      <div className="space-y-2">
        {scenarios.map((scenario) => (
          <ScenarioItem
            key={scenario.id}
            scenario={scenario}
            onLoad={onLoad}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

interface ScenarioCardProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  navigationRef: React.RefObject<HTMLDivElement | null>
  scenarioName: string
  scenarioDescription: string
  saveSuccess: boolean
  scenarios: SavedScenario[]
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSave: () => void
  onLoad: (configuration: ExtendedSavedConfiguration) => void
  onDelete: (id: string) => void
}

function ScenarioCard(props: ScenarioCardProps) {
  return (
    <Collapsible open={props.isOpen} onOpenChange={props.setIsOpen}>
      <Card ref={props.navigationRef} className="w-full">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Szenario-Verwaltung</span>
              </div>
              <ChevronDown 
                className={`h-5 w-5 transition-transform ${props.isOpen ? 'transform rotate-180' : ''}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <ScenarioSaveForm
              scenarioName={props.scenarioName}
              scenarioDescription={props.scenarioDescription}
              saveSuccess={props.saveSuccess}
              onNameChange={props.onNameChange}
              onDescriptionChange={props.onDescriptionChange}
              onSave={props.onSave}
            />
            <ScenarioList
              scenarios={props.scenarios}
              onLoad={props.onLoad}
              onDelete={props.onDelete}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function DeleteDialog({ open, onOpenChange, onConfirm }: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Szenario löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchten Sie dieses Szenario wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Löschen</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ScenarioManagement({ currentConfiguration, onLoadScenario }: ScenarioManagementProps) {
  const { scenarios, saveScenario, deleteScenario } = useScenarioManagement()
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioDescription, setScenarioDescription] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const navigationRef = useNavigationItem({
    id: 'scenario-management',
    title: 'Szenario-Verwaltung',
    icon: '💾',
    level: 0,
  })

  const { handleSave, handleDeleteClick, handleDeleteConfirm, deleteDialogOpen, setDeleteDialogOpen } =
    useScenarioHandlers(
      saveScenario,
      deleteScenario,
      currentConfiguration,
      scenarioName,
      scenarioDescription,
      setScenarioName,
      setScenarioDescription,
      setSaveSuccess
    )

  return (
    <>
      <ScenarioCard
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navigationRef={navigationRef}
        scenarioName={scenarioName}
        scenarioDescription={scenarioDescription}
        saveSuccess={saveSuccess}
        scenarios={scenarios}
        onNameChange={setScenarioName}
        onDescriptionChange={setScenarioDescription}
        onSave={handleSave}
        onLoad={onLoadScenario}
        onDelete={handleDeleteClick}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
