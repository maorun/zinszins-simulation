import { useEffect } from 'react'
import type { CoupleStatutoryPensionConfig } from '../../../../helpers/statutory-pension'

function createCoupleConfig(
  config: CoupleStatutoryPensionConfig,
): CoupleStatutoryPensionConfig {
  return {
    ...config,
    couple: {
      person1: {
        ...config.individual!,
        personId: 1 as const,
        personName: 'Person 1',
      },
      person2: {
        ...config.individual!,
        personId: 2 as const,
        personName: 'Person 2',
      },
    },
  }
}

export function usePensionConfigSync(
  planningMode: 'individual' | 'couple',
  config: CoupleStatutoryPensionConfig | null,
  setConfig: (config: CoupleStatutoryPensionConfig | null) => void,
) {
  useEffect(() => {
    if (!config || config.planningMode === planningMode) return

    const updatedConfig = { ...config, planningMode }

    if (planningMode === 'couple' && config.individual && !config.couple) {
      setConfig(createCoupleConfig(updatedConfig))
    }
    else {
      setConfig(updatedConfig)
    }
  }, [planningMode, config, setConfig])
}
