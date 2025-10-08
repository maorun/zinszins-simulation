import { describe, it, expect } from 'vitest'
import { getGlossaryTerm, getAllGlossaryTerms, searchGlossaryTerms, glossaryTerms } from './glossary'

describe('glossary', () => {
  describe('glossaryTerms data structure', () => {
    it('should have all required fields for each term', () => {
      Object.entries(glossaryTerms).forEach(([_key, term]) => {
        expect(term.term).toBeDefined()
        expect(typeof term.term).toBe('string')
        expect(term.term.length).toBeGreaterThan(0)

        expect(term.shortDefinition).toBeDefined()
        expect(typeof term.shortDefinition).toBe('string')
        expect(term.shortDefinition.length).toBeGreaterThan(0)

        expect(term.detailedExplanation).toBeDefined()
        expect(typeof term.detailedExplanation).toBe('string')
        expect(term.detailedExplanation.length).toBeGreaterThan(0)
      })
    })

    it('should have key financial terms', () => {
      expect(glossaryTerms.vorabpauschale).toBeDefined()
      expect(glossaryTerms.basiszins).toBeDefined()
      expect(glossaryTerms.kapitalertragsteuer).toBeDefined()
      expect(glossaryTerms.sparerpauschbetrag).toBeDefined()
      expect(glossaryTerms.teilfreistellung).toBeDefined()
      expect(glossaryTerms.guenstigerpruefung).toBeDefined()
      expect(glossaryTerms.grundfreibetrag).toBeDefined()
    })

    it('should have correct term names', () => {
      expect(glossaryTerms.vorabpauschale.term).toBe('Vorabpauschale')
      expect(glossaryTerms.basiszins.term).toBe('Basiszins')
      expect(glossaryTerms.kapitalertragsteuer.term).toBe('Kapitalertragsteuer')
      expect(glossaryTerms.sparerpauschbetrag.term).toBe('Sparerpauschbetrag')
      expect(glossaryTerms.teilfreistellung.term).toBe('Teilfreistellung')
      expect(glossaryTerms.guenstigerpruefung.term).toBe('Günstigerprüfung')
      expect(glossaryTerms.grundfreibetrag.term).toBe('Grundfreibetrag')
    })
  })

  describe('getGlossaryTerm', () => {
    it('should return term for valid key', () => {
      const term = getGlossaryTerm('vorabpauschale')
      expect(term).toBeDefined()
      expect(term?.term).toBe('Vorabpauschale')
    })

    it('should be case-insensitive', () => {
      const term1 = getGlossaryTerm('VORABPAUSCHALE')
      const term2 = getGlossaryTerm('Vorabpauschale')
      const term3 = getGlossaryTerm('vorabpauschale')

      expect(term1).toBeDefined()
      expect(term2).toBeDefined()
      expect(term3).toBeDefined()
      expect(term1).toEqual(term2)
      expect(term2).toEqual(term3)
    })

    it('should return undefined for invalid key', () => {
      const term = getGlossaryTerm('nonexistent')
      expect(term).toBeUndefined()
    })
  })

  describe('getAllGlossaryTerms', () => {
    it('should return all glossary terms as array', () => {
      const allTerms = getAllGlossaryTerms()
      expect(Array.isArray(allTerms)).toBe(true)
      expect(allTerms.length).toBeGreaterThan(0)
    })

    it('should have at least 10 terms', () => {
      const allTerms = getAllGlossaryTerms()
      expect(allTerms.length).toBeGreaterThanOrEqual(10)
    })

    it('should contain expected terms', () => {
      const allTerms = getAllGlossaryTerms()
      const termNames = allTerms.map(t => t.term)

      expect(termNames).toContain('Vorabpauschale')
      expect(termNames).toContain('Basiszins')
      expect(termNames).toContain('Kapitalertragsteuer')
      expect(termNames).toContain('Sparerpauschbetrag')
    })
  })

  describe('searchGlossaryTerms', () => {
    it('should find terms by term name', () => {
      const results = searchGlossaryTerms('Vorabpauschale')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].term).toBe('Vorabpauschale')
    })

    it('should find terms by partial match', () => {
      const results = searchGlossaryTerms('steuer')
      expect(results.length).toBeGreaterThan(0)
      const termNames = results.map(t => t.term)
      // Should find at least Kapitalertragsteuer, Einkommensteuersatz
      expect(termNames.some(name => name.toLowerCase().includes('steuer'))).toBe(true)
    })

    it('should find terms by definition content', () => {
      const results = searchGlossaryTerms('thesaurierende')
      expect(results.length).toBeGreaterThan(0)
      // Should find Vorabpauschale which mentions thesaurierende Fonds
      expect(results.some(t => t.term === 'Vorabpauschale')).toBe(true)
    })

    it('should be case-insensitive', () => {
      const results1 = searchGlossaryTerms('VORABPAUSCHALE')
      const results2 = searchGlossaryTerms('vorabpauschale')
      expect(results1).toEqual(results2)
    })

    it('should return empty array for no matches', () => {
      const results = searchGlossaryTerms('xyznomatchxyz')
      expect(results).toEqual([])
    })
  })

  describe('term relationships', () => {
    it('should have relatedTerms for key concepts', () => {
      const vorab = glossaryTerms.vorabpauschale
      expect(vorab.relatedTerms).toBeDefined()
      expect(Array.isArray(vorab.relatedTerms)).toBe(true)
      expect(vorab.relatedTerms!.length).toBeGreaterThan(0)
    })

    it('should link related tax concepts', () => {
      const vorab = glossaryTerms.vorabpauschale
      expect(vorab.relatedTerms).toContain('basiszins')
      expect(vorab.relatedTerms).toContain('teilfreistellung')
      expect(vorab.relatedTerms).toContain('kapitalertragsteuer')
    })
  })

  describe('term examples', () => {
    it('should provide concrete examples for key terms', () => {
      expect(glossaryTerms.vorabpauschale.example).toBeDefined()
      expect(glossaryTerms.kapitalertragsteuer.example).toBeDefined()
      expect(glossaryTerms.sparerpauschbetrag.example).toBeDefined()
      expect(glossaryTerms.teilfreistellung.example).toBeDefined()
    })

    it('should have meaningful examples with numbers', () => {
      const vorab = glossaryTerms.vorabpauschale
      expect(vorab.example).toContain('€')
      expect(vorab.example).toMatch(/\d/)
    })
  })
})
