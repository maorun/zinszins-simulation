import { type OtherIncomeConfiguration } from '../../helpers/other-income'
import { OtherIncomeCard } from './other-income/OtherIncomeCard'
import { OtherIncomeInfoBox } from './other-income/OtherIncomeInfoBox'
import { OtherIncomeEnableToggle } from './other-income/OtherIncomeEnableToggle'
import { OtherIncomeContent } from './other-income/OtherIncomeContent'
import { useOtherIncomeHandlers } from './other-income/useOtherIncomeHandlers'

interface OtherIncomeConfigurationProps {
  config: OtherIncomeConfiguration
  onChange: (config: OtherIncomeConfiguration) => void
}

export function OtherIncomeConfigurationComponent({
  config,
  onChange,
}: OtherIncomeConfigurationProps) {
  const {
    editingSource,
    isAddingNew,
    handleConfigChange,
    handleSourceChange,
    handleAddSource,
    handleSaveSource,
    handleCancelEdit,
    handleDeleteSource,
    handleEditSource,
    handleUpdateEditingSource,
  } = useOtherIncomeHandlers({ config, onChange })

  return (
    <OtherIncomeCard>
      <OtherIncomeInfoBox />

      <OtherIncomeEnableToggle
        enabled={config.enabled}
        onToggle={enabled => handleConfigChange({ enabled })}
      />

      {config.enabled && (
        <OtherIncomeContent
          sources={config.sources}
          editingSource={editingSource}
          isAddingNew={isAddingNew}
          onAddSource={handleAddSource}
          onSourceChange={handleSourceChange}
          onEditSource={handleEditSource}
          onDeleteSource={handleDeleteSource}
          onUpdateEditingSource={handleUpdateEditingSource}
          onSaveSource={handleSaveSource}
          onCancelEdit={handleCancelEdit}
        />
      )}
    </OtherIncomeCard>
  )
}
