export const TYPE_LABELS = {
  child_support: 'Kindesunterhalt',
  spousal_support: 'Nachehelicher Unterhalt',
  separation_support: 'Trennungsunterhalt',
} as const

export const FREQUENCY_LABELS = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  yearly: 'Jährlich',
} as const

export const TAX_TREATMENT_LABELS = {
  sonderausgaben: 'Sonderausgaben (Realsplitting)',
  aussergewoehnliche_belastungen: 'Außergewöhnliche Belastungen',
  none: 'Keine',
} as const
