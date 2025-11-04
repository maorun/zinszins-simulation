// Helper to format currency
export function formatEuro(amount: number): string {
  return amount.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// Get goal type label
export function getGoalTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    retirement: 'Altersvorsorge',
    independence: 'Finanzielle Unabhängigkeit',
    custom: 'Benutzerdefiniert',
  }
  return labels[type] || type
}
