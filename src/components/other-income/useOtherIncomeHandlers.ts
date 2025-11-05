import { useState } from 'react'
import {
  type OtherIncomeConfiguration,
  type OtherIncomeSource,
  createDefaultOtherIncomeSource,
} from '../../../helpers/other-income'
import {
  createConfigUpdater,
  createSourceUpdater,
  createSourceSaver,
  createSourceDeleter,
} from './otherIncomeHandlerFactories'

interface UseOtherIncomeHandlersProps {
  config: OtherIncomeConfiguration
  onChange: (config: OtherIncomeConfiguration) => void
}

export function useOtherIncomeHandlers({ config, onChange }: UseOtherIncomeHandlersProps) {
  const [editingSource, setEditingSource] = useState<OtherIncomeSource | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const handleConfigChange = createConfigUpdater(config, onChange)
  const handleSourceChange = createSourceUpdater(config, handleConfigChange)
  const handleDeleteSource = createSourceDeleter(config, handleConfigChange)

  const handleSaveSource = createSourceSaver(
    editingSource,
    isAddingNew,
    config,
    handleConfigChange,
    handleSourceChange,
    setEditingSource,
    setIsAddingNew,
  )

  const handleAddSource = () => {
    const newSource = createDefaultOtherIncomeSource('rental')
    setEditingSource(newSource)
    setIsAddingNew(true)
  }

  const handleCancelEdit = () => {
    setEditingSource(null)
    setIsAddingNew(false)
  }

  const handleEditSource = (source: OtherIncomeSource) => {
    setEditingSource({ ...source })
    setIsAddingNew(false)
  }

  return {
    editingSource,
    isAddingNew,
    handleConfigChange,
    handleSourceChange,
    handleAddSource,
    handleSaveSource,
    handleCancelEdit,
    handleDeleteSource,
    handleEditSource,
    handleUpdateEditingSource: setEditingSource,
  }
}
