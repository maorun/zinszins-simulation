import { useState } from 'react'
import { useSimulation } from '../../contexts/useSimulation'

/**
 * Custom hook for managing historical index selection state and actions
 */
export const useHistoricalIndexSelection = () => {
  const {
    historicalIndex,
    setHistoricalIndex,
    performSimulation,
  } = useSimulation()

  const [selectedIndexId, setSelectedIndexId] = useState(historicalIndex || 'dax')

  const handleIndexChange = (indexId: string) => {
    setSelectedIndexId(indexId)
    setHistoricalIndex(indexId)
    performSimulation()
  }

  return {
    selectedIndexId,
    handleIndexChange,
  }
}
