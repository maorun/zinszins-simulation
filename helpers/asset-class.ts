/**
 * Asset Class Types and German Tax Treatment
 *
 * This module defines different investment asset classes and their
 * corresponding Teilfreistellungsquoten (partial exemption quotas)
 * according to German tax law (§ 20 InvStG).
 *
 * Reference: Investmentsteuergesetz (InvStG)
 */

/**
 * Available asset classes for German tax treatment
 */
export type AssetClass =
  | 'equity-fund' // Aktienfonds (>= 51% stocks)
  | 'mixed-fund' // Mischfonds (>= 25% stocks)
  | 'bond-fund' // Rentenfonds/Anleihenfonds (< 25% stocks)
  | 'real-estate-fund' // Immobilienfonds
  | 'reit' // REIT (Real Estate Investment Trust)
  | 'commodity' // Rohstoffe
  | 'cryptocurrency' // Kryptowährungen
  | 'custom' // Benutzerdefiniert

/**
 * Asset class display names in German
 */
export const ASSET_CLASS_NAMES: Record<AssetClass, string> = {
  'equity-fund': 'Aktienfonds (≥ 51% Aktien)',
  'mixed-fund': 'Mischfonds (≥ 25% Aktien)',
  'bond-fund': 'Rentenfonds (< 25% Aktien)',
  'real-estate-fund': 'Immobilienfonds',
  reit: 'REIT',
  commodity: 'Rohstoffe',
  cryptocurrency: 'Kryptowährungen',
  custom: 'Benutzerdefiniert',
} as const

/**
 * Asset class descriptions for tooltips
 */
export const ASSET_CLASS_DESCRIPTIONS: Record<AssetClass, string> = {
  'equity-fund':
    'Investmentfonds mit mindestens 51% Aktienanteil. Profitieren von der höchsten Teilfreistellung (30%).',
  'mixed-fund': 'Investmentfonds mit 25-50% Aktienanteil. Moderate Teilfreistellung (15%).',
  'bond-fund':
    'Investmentfonds mit weniger als 25% Aktienanteil (hauptsächlich Anleihen). Niedrigste Teilfreistellung (0%).',
  'real-estate-fund':
    'Investmentfonds, die hauptsächlich in Immobilien investieren. Teilfreistellung von 60% bei inländischen Fonds, 80% bei ausländischen Fonds.',
  reit: 'Real Estate Investment Trusts - börsengehandelte Immobiliengesellschaften. Keine Teilfreistellung (0%).',
  commodity: 'Rohstoffinvestments (Gold, Öl, etc.). Keine Teilfreistellung (0%).',
  cryptocurrency:
    'Kryptowährungen wie Bitcoin, Ethereum. Unterliegen nach 1 Jahr Haltefrist keiner Besteuerung, davor privates Veräußerungsgeschäft.',
  custom: 'Benutzerdefinierte Teilfreistellungsquote für spezielle Anlageklassen.',
} as const

/**
 * Default Teilfreistellungsquoten for each asset class
 * According to § 20 InvStG (Investment Tax Act)
 *
 * Values are in decimal format (0.3 = 30%)
 */
export const DEFAULT_TEILFREISTELLUNGSQUOTEN: Record<AssetClass, number> = {
  'equity-fund': 0.3, // 30% for equity funds (§ 20 Abs. 1 InvStG)
  'mixed-fund': 0.15, // 15% for mixed funds (§ 20 Abs. 1 InvStG)
  'bond-fund': 0.0, // 0% for bond funds
  'real-estate-fund': 0.6, // 60% for domestic real estate funds (§ 20 Abs. 2 InvStG)
  reit: 0.0, // 0% for REITs
  commodity: 0.0, // 0% for commodities
  cryptocurrency: 0.0, // 0% - different tax treatment (Spekulationssteuer after 1 year holding period)
  custom: 0.3, // Default to equity fund rate, user can customize
} as const

/**
 * Get the Teilfreistellungsquote for a specific asset class
 *
 * @param assetClass - The asset class
 * @param customQuote - Optional custom quote for 'custom' asset class
 * @returns The Teilfreistellungsquote as a decimal (0.3 = 30%)
 */
export function getTeilfreistellungsquoteForAssetClass(assetClass: AssetClass, customQuote?: number): number {
  if (assetClass === 'custom' && customQuote !== undefined) {
    return customQuote
  }
  return DEFAULT_TEILFREISTELLUNGSQUOTEN[assetClass]
}

/**
 * Get the display name for an asset class
 *
 * @param assetClass - The asset class
 * @returns The German display name
 */
export function getAssetClassName(assetClass: AssetClass): string {
  return ASSET_CLASS_NAMES[assetClass]
}

/**
 * Get the description for an asset class
 *
 * @param assetClass - The asset class
 * @returns The German description
 */
export function getAssetClassDescription(assetClass: AssetClass): string {
  return ASSET_CLASS_DESCRIPTIONS[assetClass]
}

/**
 * Get all available asset classes
 *
 * @returns Array of all asset class types
 */
export function getAllAssetClasses(): AssetClass[] {
  return Object.keys(ASSET_CLASS_NAMES) as AssetClass[]
}

/**
 * Check if an asset class is the custom configuration type
 *
 * The custom asset class allows users to define their own Teilfreistellungsquote
 * rather than using the predefined values for standard asset classes.
 *
 * @param assetClass - Asset class to check
 * @returns true if the asset class is 'custom', false otherwise
 *
 * @example
 * ```typescript
 * isCustomAssetClass('equity')  // false
 * isCustomAssetClass('custom')  // true
 * ```
 */
export function isCustomAssetClass(assetClass: AssetClass): boolean {
  return assetClass === 'custom'
}

/**
 * Format Teilfreistellungsquote for display
 *
 * @param quote - The quote as decimal (0.3 = 30%)
 * @returns Formatted string with percentage
 */
export function formatTeilfreistellungsquote(quote: number): string {
  return `${(quote * 100).toFixed(0)} %`
}
