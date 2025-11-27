import { useCallback } from 'react'
import { useSimulation } from '../../contexts/useSimulation'
import { getDefaultAlimonyPayment, type AlimonyConfig, type AlimonyPaymentConfig } from '../../../helpers/alimony'

/**
 * Custom hook for alimony configuration logic
 * Handles all state management for alimony planning
 */
export function useAlimony() {
  const { alimonyConfig, setAlimonyConfig } = useSimulation()

  const updateConfig = useCallback(
    (updates: Partial<AlimonyConfig>) => {
      setAlimonyConfig({ ...alimonyConfig, ...updates })
    },
    [alimonyConfig, setAlimonyConfig],
  )

  const handleToggleEnabled = useCallback((checked: boolean) => updateConfig({ enabled: checked }), [updateConfig])

  const handleAddPayment = useCallback(() => {
    const newPayment = getDefaultAlimonyPayment()
    updateConfig({ payments: [...alimonyConfig.payments, newPayment] })
  }, [alimonyConfig.payments, updateConfig])

  const handleUpdatePayment = useCallback(
    (index: number, payment: AlimonyPaymentConfig) => {
      const newPayments = [...alimonyConfig.payments]
      newPayments[index] = payment
      updateConfig({ payments: newPayments })
    },
    [alimonyConfig.payments, updateConfig],
  )

  const handleRemovePayment = useCallback(
    (index: number) => {
      const newPayments = alimonyConfig.payments.filter((_, i) => i !== index)
      updateConfig({ payments: newPayments })
    },
    [alimonyConfig.payments, updateConfig],
  )

  return {
    config: alimonyConfig,
    handleToggleEnabled,
    handleAddPayment,
    handleUpdatePayment,
    handleRemovePayment,
  }
}
