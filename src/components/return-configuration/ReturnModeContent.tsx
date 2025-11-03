import type { ReturnMode } from '../../utils/random-returns'
import type { MultiAssetPortfolioConfig } from '../../../helpers/multi-asset-portfolio'
import { NestingProvider } from '../../lib/nesting-context'
import FixedReturnConfiguration from '../FixedReturnConfiguration'
import HistoricalReturnConfiguration from '../HistoricalReturnConfiguration'
import RandomReturnConfiguration from '../RandomReturnConfiguration'
import VariableReturnConfiguration from '../VariableReturnConfiguration'
import MultiAssetPortfolioConfiguration from '../MultiAssetPortfolioConfiguration'

interface ReturnModeContentProps {
  returnMode: ReturnMode
  multiAssetConfig: MultiAssetPortfolioConfig
  onMultiAssetConfigChange: (config: MultiAssetPortfolioConfig) => void
}

const ReturnModeContent = ({
  returnMode,
  multiAssetConfig,
  onMultiAssetConfigChange,
}: ReturnModeContentProps) => {
  return (
    <NestingProvider>
      {returnMode === 'fixed' && <FixedReturnConfiguration />}
      {returnMode === 'random' && <RandomReturnConfiguration />}
      {returnMode === 'variable' && <VariableReturnConfiguration />}
      {returnMode === 'historical' && <HistoricalReturnConfiguration />}
      {returnMode === 'multiasset' && (
        <MultiAssetPortfolioConfiguration
          values={multiAssetConfig}
          onChange={onMultiAssetConfigChange}
          nestingLevel={1}
        />
      )}
    </NestingProvider>
  )
}

export default ReturnModeContent
