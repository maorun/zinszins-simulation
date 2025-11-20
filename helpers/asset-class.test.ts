import { describe, it, expect } from 'vitest'
import {
  type AssetClass,
  DEFAULT_TEILFREISTELLUNGSQUOTEN,
  ASSET_CLASS_NAMES,
  ASSET_CLASS_DESCRIPTIONS,
  getTeilfreistellungsquoteForAssetClass,
  getAssetClassName,
  getAssetClassDescription,
  getAllAssetClasses,
  isCustomAssetClass,
  formatTeilfreistellungsquote,
} from './asset-class'

describe('asset-class', () => {
  describe('DEFAULT_TEILFREISTELLUNGSQUOTEN', () => {
    it('should have correct rate for equity-fund (30%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['equity-fund']).toBe(0.3)
    })

    it('should have correct rate for mixed-fund (15%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['mixed-fund']).toBe(0.15)
    })

    it('should have correct rate for bond-fund (0%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['bond-fund']).toBe(0.0)
    })

    it('should have correct rate for real-estate-fund (60%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['real-estate-fund']).toBe(0.6)
    })

    it('should have correct rate for reit (0%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['reit']).toBe(0.0)
    })

    it('should have correct rate for commodity (0%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['commodity']).toBe(0.0)
    })

    it('should have correct rate for cryptocurrency (0%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['cryptocurrency']).toBe(0.0)
    })

    it('should have default rate for custom (30%)', () => {
      expect(DEFAULT_TEILFREISTELLUNGSQUOTEN['custom']).toBe(0.3)
    })
  })

  describe('ASSET_CLASS_NAMES', () => {
    it('should have German names for all asset classes', () => {
      expect(ASSET_CLASS_NAMES['equity-fund']).toBe('Aktienfonds (≥ 51% Aktien)')
      expect(ASSET_CLASS_NAMES['mixed-fund']).toBe('Mischfonds (≥ 25% Aktien)')
      expect(ASSET_CLASS_NAMES['bond-fund']).toBe('Rentenfonds (< 25% Aktien)')
      expect(ASSET_CLASS_NAMES['real-estate-fund']).toBe('Immobilienfonds')
      expect(ASSET_CLASS_NAMES['reit']).toBe('REIT')
      expect(ASSET_CLASS_NAMES['commodity']).toBe('Rohstoffe')
      expect(ASSET_CLASS_NAMES['cryptocurrency']).toBe('Kryptowährungen')
      expect(ASSET_CLASS_NAMES['custom']).toBe('Benutzerdefiniert')
    })
  })

  describe('ASSET_CLASS_DESCRIPTIONS', () => {
    it('should have descriptions for all asset classes', () => {
      const assetClasses: AssetClass[] = [
        'equity-fund',
        'mixed-fund',
        'bond-fund',
        'real-estate-fund',
        'reit',
        'commodity',
        'cryptocurrency',
        'custom',
      ]

      assetClasses.forEach(assetClass => {
        expect(ASSET_CLASS_DESCRIPTIONS[assetClass]).toBeDefined()
        expect(ASSET_CLASS_DESCRIPTIONS[assetClass].length).toBeGreaterThan(0)
      })
    })

    it('should mention Teilfreistellung in equity-fund description', () => {
      expect(ASSET_CLASS_DESCRIPTIONS['equity-fund']).toContain('Teilfreistellung')
      expect(ASSET_CLASS_DESCRIPTIONS['equity-fund']).toContain('30%')
    })

    it('should mention tax treatment in cryptocurrency description', () => {
      expect(ASSET_CLASS_DESCRIPTIONS['cryptocurrency']).toContain('1 Jahr')
    })
  })

  describe('getTeilfreistellungsquoteForAssetClass', () => {
    it('should return correct quote for equity-fund', () => {
      expect(getTeilfreistellungsquoteForAssetClass('equity-fund')).toBe(0.3)
    })

    it('should return correct quote for mixed-fund', () => {
      expect(getTeilfreistellungsquoteForAssetClass('mixed-fund')).toBe(0.15)
    })

    it('should return correct quote for bond-fund', () => {
      expect(getTeilfreistellungsquoteForAssetClass('bond-fund')).toBe(0.0)
    })

    it('should return correct quote for real-estate-fund', () => {
      expect(getTeilfreistellungsquoteForAssetClass('real-estate-fund')).toBe(0.6)
    })

    it('should return correct quote for reit', () => {
      expect(getTeilfreistellungsquoteForAssetClass('reit')).toBe(0.0)
    })

    it('should return correct quote for commodity', () => {
      expect(getTeilfreistellungsquoteForAssetClass('commodity')).toBe(0.0)
    })

    it('should return correct quote for cryptocurrency', () => {
      expect(getTeilfreistellungsquoteForAssetClass('cryptocurrency')).toBe(0.0)
    })

    it('should use custom quote when provided for custom asset class', () => {
      expect(getTeilfreistellungsquoteForAssetClass('custom', 0.45)).toBe(0.45)
    })

    it('should return default custom quote when custom quote not provided', () => {
      expect(getTeilfreistellungsquoteForAssetClass('custom')).toBe(0.3)
    })

    it('should ignore custom quote for non-custom asset classes', () => {
      expect(getTeilfreistellungsquoteForAssetClass('equity-fund', 0.45)).toBe(0.3)
    })
  })

  describe('getAssetClassName', () => {
    it('should return correct German name for each asset class', () => {
      expect(getAssetClassName('equity-fund')).toBe('Aktienfonds (≥ 51% Aktien)')
      expect(getAssetClassName('mixed-fund')).toBe('Mischfonds (≥ 25% Aktien)')
      expect(getAssetClassName('bond-fund')).toBe('Rentenfonds (< 25% Aktien)')
      expect(getAssetClassName('real-estate-fund')).toBe('Immobilienfonds')
      expect(getAssetClassName('reit')).toBe('REIT')
      expect(getAssetClassName('commodity')).toBe('Rohstoffe')
      expect(getAssetClassName('cryptocurrency')).toBe('Kryptowährungen')
      expect(getAssetClassName('custom')).toBe('Benutzerdefiniert')
    })
  })

  describe('getAssetClassDescription', () => {
    it('should return correct description for each asset class', () => {
      const assetClasses: AssetClass[] = [
        'equity-fund',
        'mixed-fund',
        'bond-fund',
        'real-estate-fund',
        'reit',
        'commodity',
        'cryptocurrency',
        'custom',
      ]

      assetClasses.forEach(assetClass => {
        const description = getAssetClassDescription(assetClass)
        expect(description).toBeDefined()
        expect(description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getAllAssetClasses', () => {
    it('should return all asset class types', () => {
      const allClasses = getAllAssetClasses()
      expect(allClasses).toHaveLength(8)
      expect(allClasses).toContain('equity-fund')
      expect(allClasses).toContain('mixed-fund')
      expect(allClasses).toContain('bond-fund')
      expect(allClasses).toContain('real-estate-fund')
      expect(allClasses).toContain('reit')
      expect(allClasses).toContain('commodity')
      expect(allClasses).toContain('cryptocurrency')
      expect(allClasses).toContain('custom')
    })
  })

  describe('isCustomAssetClass', () => {
    it('should return true for custom asset class', () => {
      expect(isCustomAssetClass('custom')).toBe(true)
    })

    it('should return false for non-custom asset classes', () => {
      expect(isCustomAssetClass('equity-fund')).toBe(false)
      expect(isCustomAssetClass('mixed-fund')).toBe(false)
      expect(isCustomAssetClass('bond-fund')).toBe(false)
      expect(isCustomAssetClass('real-estate-fund')).toBe(false)
      expect(isCustomAssetClass('reit')).toBe(false)
      expect(isCustomAssetClass('commodity')).toBe(false)
      expect(isCustomAssetClass('cryptocurrency')).toBe(false)
    })
  })

  describe('formatTeilfreistellungsquote', () => {
    it('should format 0.3 as "30 %"', () => {
      expect(formatTeilfreistellungsquote(0.3)).toBe('30 %')
    })

    it('should format 0.15 as "15 %"', () => {
      expect(formatTeilfreistellungsquote(0.15)).toBe('15 %')
    })

    it('should format 0.6 as "60 %"', () => {
      expect(formatTeilfreistellungsquote(0.6)).toBe('60 %')
    })

    it('should format 0.0 as "0 %"', () => {
      expect(formatTeilfreistellungsquote(0.0)).toBe('0 %')
    })

    it('should format 0.45 as "45 %"', () => {
      expect(formatTeilfreistellungsquote(0.45)).toBe('45 %')
    })

    it('should round to nearest integer', () => {
      expect(formatTeilfreistellungsquote(0.333)).toBe('33 %')
      expect(formatTeilfreistellungsquote(0.666)).toBe('67 %')
    })
  })
})
