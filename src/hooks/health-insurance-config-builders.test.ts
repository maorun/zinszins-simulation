import { describe, it, expect } from 'vitest'
import { createCouplePreviewConfig, createIndividualPreviewConfig } from './health-insurance-config-builders'

describe('health-insurance-config-builders', () => {
  describe('createCouplePreviewConfig', () => {
    it('should create couple config with all default values', () => {
      const values = {
        enabled: true,
        insuranceType: 'statutory' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: false,
        additionalCareInsuranceAge: 23,
      }

      const config = createCouplePreviewConfig(values)

      expect(config.planningMode).toBe('couple')
      expect(config.insuranceType).toBe('statutory')
      expect(config.statutoryHealthInsuranceRate).toBe(14.6)
      expect(config.statutoryCareInsuranceRate).toBe(3.4)
      expect(config.coupleConfig).toBeDefined()
      expect(config.coupleConfig?.strategy).toBe('optimize')
      expect(config.coupleConfig?.person1.birthYear).toBe(1980)
      expect(config.coupleConfig?.person2.birthYear).toBe(1980)
    })

    it('should use provided birth years', () => {
      const values = {
        enabled: true,
        insuranceType: 'statutory' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: false,
        additionalCareInsuranceAge: 23,
      }

      const config = createCouplePreviewConfig(values, 1985, 1987)

      expect(config.coupleConfig?.person1.birthYear).toBe(1985)
      expect(config.coupleConfig?.person2.birthYear).toBe(1987)
    })

    it('should use custom couple strategy', () => {
      const values = {
        enabled: true,
        insuranceType: 'statutory' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: false,
        additionalCareInsuranceAge: 23,
        coupleStrategy: 'family' as const,
      }

      const config = createCouplePreviewConfig(values)

      expect(config.coupleConfig?.strategy).toBe('family')
    })

    it('should use custom person names and withdrawal shares', () => {
      const values = {
        enabled: true,
        insuranceType: 'statutory' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: false,
        additionalCareInsuranceAge: 23,
        person1Name: 'Alice',
        person1WithdrawalShare: 0.6,
        person2Name: 'Bob',
        person2WithdrawalShare: 0.4,
      }

      const config = createCouplePreviewConfig(values)

      expect(config.coupleConfig?.person1.name).toBe('Alice')
      expect(config.coupleConfig?.person1.withdrawalShare).toBe(0.6)
      expect(config.coupleConfig?.person2.name).toBe('Bob')
      expect(config.coupleConfig?.person2.withdrawalShare).toBe(0.4)
    })

    it('should use custom family insurance thresholds', () => {
      const values = {
        enabled: true,
        insuranceType: 'statutory' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: false,
        additionalCareInsuranceAge: 23,
        familyInsuranceThresholdRegular: 600,
        familyInsuranceThresholdMiniJob: 650,
      }

      const config = createCouplePreviewConfig(values)

      expect(config.coupleConfig?.familyInsuranceThresholds.regularEmploymentLimit).toBe(600)
      expect(config.coupleConfig?.familyInsuranceThresholds.miniJobLimit).toBe(650)
    })
  })

  describe('createIndividualPreviewConfig', () => {
    it('should create individual config with all values', () => {
      const values = {
        enabled: true,
        insuranceType: 'statutory' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: true,
        additionalCareInsuranceAge: 25,
      }

      const config = createIndividualPreviewConfig(values)

      expect(config.planningMode).toBe('individual')
      expect(config.insuranceType).toBe('statutory')
      expect(config.statutoryHealthInsuranceRate).toBe(14.6)
      expect(config.statutoryCareInsuranceRate).toBe(3.4)
      expect(config.statutoryMinimumIncomeBase).toBe(1178.33)
      expect(config.statutoryMaximumIncomeBase).toBe(5175.0)
      expect(config.additionalCareInsuranceForChildless).toBe(true)
      expect(config.additionalCareInsuranceAge).toBe(25)
    })

    it('should create config with private insurance type', () => {
      const values = {
        enabled: true,
        insuranceType: 'private' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: false,
        additionalCareInsuranceAge: 23,
      }

      const config = createIndividualPreviewConfig(values)

      expect(config.insuranceType).toBe('private')
    })

    it('should create config for individual mode', () => {
      const values = {
        enabled: true,
        insuranceType: 'statutory' as const,
        statutoryHealthInsuranceRate: 14.6,
        statutoryCareInsuranceRate: 3.4,
        statutoryMinimumIncomeBase: 1178.33,
        statutoryMaximumIncomeBase: 5175.0,
        additionalCareInsuranceForChildless: false,
        additionalCareInsuranceAge: 23,
      }

      const config = createIndividualPreviewConfig(values)

      // Individual config has planningMode set to 'individual'
      expect(config.planningMode).toBe('individual')
    })
  })
})
