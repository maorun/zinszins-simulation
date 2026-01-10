# Test-Dokumentation - Zinseszins-Simulation

## Überblick

Dieses Dokument beschreibt die Test-Struktur, Best Practices und Richtlinien für das Zinszins-Simulation Projekt.

## Test-Statistiken (Stand: Januar 2026)

- **Gesamt-Test-Dateien**: 485
- **Gesamt-Tests**: 6473
- **Erfolgsrate**: 100% (6467 bestanden, 6 übersprungen)
- **Test-Framework**: Vitest 2.1.9
- **Test-Umgebung**: jsdom (für React-Komponententests)
- **Durchschnittliche Testdauer**: ~223-248s (abhängig von Umgebung)

## Test-Performance-Optimierung

Die Tests in diesem Projekt sind für Geschwindigkeit und Zuverlässigkeit optimiert, insbesondere in CI/CD-Umgebungen.

### Aktuelle Konfiguration

Die Vitest-Konfiguration (`vitest.config.ts`) nutzt mehrere Performance-Optimierungen:

1. **Thread Pool**: Verwendung von Worker Threads statt Prozess-Forks für schnellere Parallelisierung
2. **CI-spezifische Worker-Limits**: Explizite Worker-Anzahl in CI (2-4 Worker) um Überlastung zu vermeiden
3. **Lokale Entwicklung**: Vitest-Defaults für optimale lokale Performance
4. **File Parallelism**: Test-Dateien werden parallel ausgeführt

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads', // Schneller als 'forks'
    poolOptions: isCI 
      ? { threads: { minThreads: 2-4, maxThreads: 2-4 } } 
      : undefined, // Vitest-Defaults für lokale Entwicklung
    fileParallelism: true,
  },
})
```

### Performance-Metriken

| Umgebung | Konfiguration | Test-Dateien | Tests | Dauer |
|----------|--------------|--------------|-------|-------|
| Lokal | Thread Pool | 485 | 6473 | ~248s |
| CI | Thread Pool + Worker Limits | 485 | 6473 | ~160-190s (erwartet) |

### Best Practices für schnelle Tests

#### 1. Test-Isolierung beibehalten

**❌ Nicht empfohlen**: `isolate: false` kann Tests um 10-20% beschleunigen, bricht aber 40+ Tests:

```typescript
// NICHT verwenden
test: {
  isolate: false, // Bricht Tests mit globalen Zuständen
}
```

**✅ Empfohlen**: Test-Isolierung beibehalten für Zuverlässigkeit:

```typescript
// Standard-Konfiguration (isolate: true ist Standard)
test: {
  // isolate: true ist implizit
}
```

#### 2. Parallele Test-Ausführung nutzen

Tests werden automatisch parallel auf Datei-Ebene ausgeführt. Innerhalb von Dateien können Tests mit `test.concurrent()` parallelisiert werden:

```typescript
// Für I/O-lastige oder asynchrone Tests
describe('Async operations', () => {
  test.concurrent('fetches data 1', async () => {
    // ...
  })
  
  test.concurrent('fetches data 2', async () => {
    // ...
  })
})
```

#### 3. CI-Umgebungen optimieren

GitHub Actions und andere CI-Umgebungen haben oft begrenzte Ressourcen:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    env:
      CI: true # Aktiviert CI-spezifische Optimierungen
```

#### 4. Test-Timeouts angemessen setzen

```typescript
// vitest.config.ts
test: {
  testTimeout: 3000,  // 3 Sekunden pro Test
  hookTimeout: 1000,  // 1 Sekunde für Hooks
}
```

#### 5. Kostspielige Setup-Operationen vermeiden

```typescript
// ❌ Langsam: Setup in jedem Test
describe('Component', () => {
  it('test 1', () => {
    const expensiveData = generateLargeDataset()
    // ...
  })
  
  it('test 2', () => {
    const expensiveData = generateLargeDataset()
    // ...
  })
})

// ✅ Schneller: Setup einmal
describe('Component', () => {
  const expensiveData = generateLargeDataset()
  
  it('test 1', () => {
    // Nutze expensiveData
  })
  
  it('test 2', () => {
    // Nutze expensiveData
  })
})
```

### Weitere Optimierungsstrategien

#### Für große Test-Suites (>1000 Tests)

1. **Test Sharding**: Verteilung von Tests auf mehrere CI-Runner

```yaml
# GitHub Actions mit Sharding
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm run test -- --shard=${{ matrix.shard }}/4
```

2. **Selektive Test-Ausführung**: Nur geänderte Tests ausführen

```bash
# Nur Tests für geänderte Dateien
npm run test -- --changed
```

3. **Watch-Mode für lokale Entwicklung**

```bash
# Automatische Test-Wiederholung bei Änderungen
npm run test:watch
```

### Monitoring und Profiling

#### Langsame Tests identifizieren

```bash
# Reporter für langsame Tests
npm run test -- --reporter=verbose
```

#### Test-Coverage mit Performance-Fokus

```bash
# Coverage ohne langsame HTML-Reports
npm run test:coverage -- --reporter=text
```

### Häufige Performance-Probleme

1. **Problem**: Tests sind langsam in CI
   - **Lösung**: Worker-Limits gesetzt (bereits implementiert)

2. **Problem**: Flaky Tests in paralleler Ausführung
   - **Lösung**: Globale Zustände vermeiden, Mocks richtig aufräumen

3. **Problem**: Speicherprobleme bei vielen Tests
   - **Lösung**: Worker-Anzahl reduzieren, Tests in Batches ausführen

### Zukünftige Verbesserungen

Mögliche weitere Optimierungen für noch schnellere Tests:

1. **Test Sharding in CI**: Bei weiterem Test-Wachstum
2. **Caching von Test-Artifacts**: Vite-Cache für schnellere Transforms
3. **Selektive Test-Ausführung**: Abhängigkeitsanalyse für Smart Testing
4. **Browser-Mode**: Native Browser-Tests für UI-kritische Tests

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

## Test Coverage Improvements - Beispielprojekt

### Überblick

Dieser Abschnitt dokumentiert ein Beispielprojekt zur systematischen Identifikation und Implementierung fehlender Tests. Das Projekt zeigt, wie Test-Lücken eigenständig identifiziert und geschlossen werden können.

### Methodik

**Systematische Analyse**:

1. Review von Source-Dateien ohne entsprechende Test-Dateien
2. Analyse kritischer Utility-Funktionen und Komponenten
3. Fokus auf high-impact Bereiche (finanzielle Berechnungen, Kern-Utilities)

**Priorisierung nach Impact**:

- **HIGH**: Financial calculation utilities (KPI calculations)
- **MEDIUM**: Core infrastructure (Chart.js setup, component helpers)
- **LOW**: Type utilities and edge cases

**Implementation Best Practices**:

- Arrange-Act-Assert Pattern
- Comprehensive edge case coverage
- Integration tests for workflows
- Type-safe test implementations

### Beispiel: Hinzugefügte Tests

In einem Beispielprojekt wurden 137 neue Tests in 4 kritischen Bereichen hinzugefügt:

#### 1. KPI Calculations Tests (62 tests)

**Abgedeckte Bereiche**:

- Sparquote-Berechnungen (10 tests)
  - Normal cases, edge cases (zero/negative income)
  - Boundary testing (clamping to 100%)
  - Decimal value handling
- Vermögensaufbau-Raten (10 tests)
  - Target achievement scenarios
  - Edge cases (zero years, negative years)
- Rentenlücken-Berechnungen (10 tests)
- Benötigtes Portfolio (9 tests)
- Sparquote-Bewertung (8 tests)
- Integration tests (6 tests)

**Beispiel**:

```typescript
// src/utils/kpi-calculations.test.ts
describe('calculateSavingsRate', () => {
  it('should calculate savings rate correctly for typical values', () => {
    const result = calculateSavingsRate(2000, 10000)
    expect(result).toBe(20)
  })

  it('should return 0 for zero income', () => {
    const result = calculateSavingsRate(1000, 0)
    expect(result).toBe(0)
  })

  it('should clamp result to 100% maximum', () => {
    const result = calculateSavingsRate(15000, 10000)
    expect(result).toBe(100)
  })
})
```

#### 2. Chart Setup Tests (18 tests)

**Abgedeckte Bereiche**:

- Component registration (5 tests)
- Integration mit Chart.js (3 tests)
- Module state management (2 tests)
- Error handling (2 tests)
- Performance (2 tests)
- Component verification (4 tests)

**Key Features**:

- Idempotency verification (mehrfache Aufrufe sicher)
- Performance testing
- Integration testing mit Chart.js library

#### 3. Withdrawal Mode Helpers Tests (28 tests)

**Abgedeckte Bereiche**:

- Mode change handling (12 tests)
- Comparison strategy management (12 tests)
- Integration workflows (2 tests)
- Edge case handling (2 tests)

**Key Features**:

- German retirement planning workflows
- Withdrawal strategy configuration
- Array immutability verification

#### 4. Utility Types Tests (29 tests)

**Abgedeckte Bereiche**:

- Type utility verification (7 tests)
- Result type pattern (6 tests)
- Immutable types (2 tests)
- Nullable types (3 tests)
- Maybe types (5 tests)
- Integration scenarios (5 tests)

### Test-Qualitätsmerkmale

**Code Quality**:

- Keine eslint-disable comments
- Vollständige TypeScript-Typisierung
- Arrange-Act-Assert Pattern durchgehend
- Beschreibende Test-Namen

**Coverage Characteristics**:

- Extensive edge case coverage (null, undefined, negative values, boundary conditions)
- Integration tests ergänzen unit tests
- Explizite error scenario testing
- Performance validation wo relevant

**Test Isolation**:

- Jeder Test läuft unabhängig
- Proper use of Vitest mocks mit beforeEach/afterEach cleanup
- Keine side effects auf global state

### Validierungsergebnisse

```text
Test Files  481 passed (481)
Tests       6,368 passed | 6 skipped (6,374)
Duration    221.31s
```

- ✅ Alle Tests bestehen
- ✅ Keine flaky tests
- ✅ Build und Lint erfolgreich

### Impact Assessment

**Quantitativer Impact**:

- +137 tests (2.2% Erhöhung)
- +4 test files für vorher ungetestete utilities
- 100% pass rate erhalten

**Qualitativer Impact**:

1. **Critical Utility Coverage**: KPI calculations haben nun comprehensive test coverage
2. **Infrastructure Reliability**: Chart setup und component helpers sind getestet
3. **Type Safety Validation**: Runtime behavior von type utilities validiert
4. **Edge Case Protection**: Extensive edge case testing verhindert unexpected behavior

### Empfehlungen für zukünftige Arbeit

**High Priority**:

1. Tests für custom hooks in components hinzufügen
2. Integration tests für komplexe user workflows
3. Performance tests für heavy calculations (Monte Carlo simulations)

**Medium Priority**:

1. Visual regression tests für UI components
2. Accessibility tests für forms und interactive elements
3. Tests für error boundary behavior

**Low Priority**:

1. Tests für remaining display components
2. Tests für configuration wrapper components
3. Erhöhung der edge case coverage in existing tests

## Wartung

Diese Dokumentation sollte aktualisiert werden, wenn:

- Neue Test-Patterns etabliert werden
- Neue Test-Tools hinzugefügt werden
- Best Practices sich ändern
- Neue häufige Probleme identifiziert werden
- Test Coverage Improvements durchgeführt werden (siehe Beispielprojekt oben)
