# Test-Dokumentation - Zinseszins-Simulation

## Überblick

Dieses Dokument beschreibt die Test-Struktur, Best Practices und Richtlinien für das Zinszins-Simulation Projekt.

## Test-Statistiken (Stand: Dezember 2024)

- **Gesamt-Test-Dateien**: 304
- **Gesamt-Tests**: 2620
- **Erfolgsrate**: 100% (2615 bestanden, 5 übersprungen)
- **Test-Framework**: Vitest 2.1.9
- **Test-Umgebung**: jsdom (für React-Komponententests)

## Test-Struktur

### 1. Unit-Tests

Unit-Tests testen einzelne Funktionen und Module isoliert.

#### Beispiel: Helper-Funktionen

```typescript
// helpers/steuer.test.ts
import { describe, it, expect } from 'vitest'
import { calculateVorabpauschale } from './steuer'

describe('steuer', () => {
  describe('calculateVorabpauschale', () => {
    it('should calculate Vorabpauschale correctly for 2023', () => {
      const result = calculateVorabpauschale({
        year: 2023,
        startCapital: 100000,
        endCapital: 105000,
        basiszins: 0.0255,
      })
      
      expect(result).toBeCloseTo(1785, 0)
    })
  })
})
```

#### Beispiel: Utility-Funktionen

```typescript
// src/utils/array-utils.test.ts
import { describe, it, expect } from 'vitest'
import { unique } from './array-utils'

describe('array-utils', () => {
  describe('unique', () => {
    it('should return unique numbers from an array', () => {
      const input = [1, 2, 3, 2, 1, 4, 3, 5]
      const result = unique(input)
      expect(result).toEqual([1, 2, 3, 4, 5])
    })
  })
})
```

### 2. Komponenten-Tests

Komponenten-Tests verwenden React Testing Library, um UI-Komponenten zu testen.

```typescript
// src/components/Header.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from './Header'

describe('Header', () => {
  it('renders the application title', () => {
    render(<Header />)
    expect(screen.getByText('💼 Zinseszins-Simulation')).toBeInTheDocument()
  })
})
```

### 3. Integration-Tests

Integration-Tests testen das Zusammenspiel mehrerer Komponenten oder Module.

```typescript
// src/App.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock externe Abhängigkeiten
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

describe('App Integration Tests', () => {
  it('loads the application with basic UI elements', async () => {
    render(<App />)
    
    await waitFor(
      () => {
        expect(screen.getByText('💼 Zinseszins-Simulation')).toBeInTheDocument()
      },
      { timeout: 2500 }
    )
  }, 10000) // Erhöhte Timeout für langsame Integration-Tests
})
```

## API-Mocking

### Bundesbank API

Die Bundesbank API wird für Tests gemockt, um:

- Netzwerkabhängigkeiten zu eliminieren
- Tests schnell und zuverlässig zu machen
- Fallback-Mechanismen zu testen

```typescript
// src/services/bundesbank-api.test.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchBasiszinsFromBundesbank } from './bundesbank-api'

// Mock fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Bundesbank API', () => {
  it('should fall back to historical data when API fails', async () => {
    mockFetch.mockRejectedValue(new Error('API not available'))
    
    const result = await fetchBasiszinsFromBundesbank(2023, 2024)
    
    expect(result[0].source).toBe('fallback')
    expect(result[0].rate).toBe(0.0255) // 2023 rate
  })
})
```

### Vercel Analytics

Vercel Analytics wird in Tests gemockt, um Netzwerk-Aufrufe zu vermeiden:

```typescript
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))
```

## Best Practices

### 1. Test-Isolierung

Jeder Test sollte unabhängig von anderen Tests laufen:

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    // Setup für jeden Test
    localStorage.clear()
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    // Cleanup nach jedem Test
    vi.restoreAllMocks()
  })
})
```

### 2. Aussagekräftige Test-Namen

Test-Namen sollten klar beschreiben, was getestet wird:

```typescript
// ✅ Gut
it('should calculate compound interest correctly for 5 years', () => {})

// ❌ Schlecht
it('test1', () => {})
```

### 3. Arrange-Act-Assert Pattern

Struktur jeden Test in drei Phasen:

```typescript
it('should format currency correctly', () => {
  // Arrange - Setup
  const amount = 1234.56
  
  // Act - Ausführung
  const result = formatCurrency(amount)
  
  // Assert - Überprüfung
  expect(result).toBe('1.234,56 €')
})
```

### 4. Umfassende Edge Cases

Teste nicht nur den Happy Path:

```typescript
describe('unique function', () => {
  it('should return empty array for null input', () => {
    expect(unique(null)).toEqual([])
  })
  
  it('should return empty array for undefined input', () => {
    expect(unique(undefined)).toEqual([])
  })
  
  it('should handle empty array', () => {
    expect(unique([])).toEqual([])
  })
  
  it('should filter undefined values', () => {
    expect(unique([1, undefined, 2])).toEqual([1, 2])
  })
})
```

### 5. Timeout-Management

Für langsame Tests (z.B. Integration-Tests) explizite Timeouts verwenden:

```typescript
it('should load complete application', async () => {
  // Test-Code
}, 10000) // 10 Sekunden Timeout für diesen spezifischen Test
```

### 6. Console-Noise reduzieren

Mocke Console-Methoden in Tests, um Noise zu reduzieren:

```typescript
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
```

## Test-Coverage

### Coverage-Report generieren

```bash
npm run test:coverage
```

Dies generiert einen detaillierten Coverage-Report in `coverage/`.

### Coverage-Ziele

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Wichtige Bereiche für Coverage

1. **Finanzielle Berechnungen** (helpers/):
   - Vorabpauschale-Berechnung
   - Zinseszins-Simulation
   - Entnahme-Strategien
   - Steuer-Optimierung

2. **Kern-Utilities** (src/utils/):
   - Array-Manipulationen
   - Zufallszahlen-Generierung
   - Monte Carlo-Simulationen
   - Strategie-Defaults

3. **UI-Komponenten** (src/components/):
   - Formular-Komponenten
   - Display-Komponenten
   - Navigation

## Test-Ausführung

### Alle Tests ausführen

```bash
npm run test
```

### Tests im Watch-Mode

```bash
npm run test:watch
```

### Spezifische Tests ausführen

```bash
npm run test -- src/utils/array-utils.test.ts
```

### Tests mit Coverage

```bash
npm run test:coverage
```

## Häufige Probleme und Lösungen

### Problem: Test-Timeout

**Symptom**: Tests schlagen mit "Test timed out" fehl.

**Lösung**: Erhöhe den Timeout für langsame Tests:

```typescript
it('slow test', async () => {
  // Test-Code
}, 10000) // 10 Sekunden
```

### Problem: React-Warnings in Tests

**Symptom**: Viele Warnungen über fehlende act() wrapper.

**Lösung**: Verwende `waitFor` für asynchrone Updates:

```typescript
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

### Problem: Flaky Tests

**Symptom**: Tests schlagen manchmal fehl, manchmal nicht.

**Lösung**:

- Verwende feste Seeds für Zufallszahlen
- Mocke Zeit-abhängige Funktionen
- Verwende `waitFor` für asynchrone Operationen

```typescript
// Fester Seed für reproduzierbare Zufallszahlen
const config = {
  averageReturn: 0.07,
  seed: 12345 // Fester Seed
}
```

## Monte Carlo Tests

Monte Carlo-Simulationen erfordern besondere Aufmerksamkeit:

```typescript
describe('Monte Carlo', () => {
  it('should be reproducible with same seed', () => {
    const config = { averageReturn: 0.07, seed: 42 }
    
    const result1 = generateRandomReturns([2020, 2021], config)
    const result2 = generateRandomReturns([2020, 2021], config)
    
    expect(result1).toEqual(result2)
  })
  
  it('should calculate statistics correctly', () => {
    const results = [1, 2, 3, 4, 5]
    const stats = calculateMonteCarloStatistics(results)
    
    expect(stats.mean).toBe(3)
    expect(stats.median).toBe(3)
    expect(stats.percentile5).toBeDefined()
    expect(stats.percentile95).toBeDefined()
  })
})
```

## Weitere Ressourcen

- [Vitest Dokumentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Wartung

Diese Dokumentation sollte aktualisiert werden, wenn:

- Neue Test-Patterns etabliert werden
- Neue Test-Tools hinzugefügt werden
- Best Practices sich ändern
- Neue häufige Probleme identifiziert werden
