---
name: fehlende-tests
about: Eigenständige Identifikation und Implementierung fehlender Tests
title: 'Tests: Fehlende Test-Abdeckung eigenständig identifizieren und implementieren'
labels: Copilot, tests, code-quality
assignees: 'Copilot'
---

## 📋 Aufgabenbeschreibung

Identifiziere **eigenständig** fehlende Tests im Projekt und implementiere umfassende Test-Coverage. Du musst selbst analysieren, welche Tests fehlen oder unzureichend sind, ohne dass der User spezifische Bereiche nennt.

## 🎯 Zu befolgende Schritte

### 1. Vorbereitung und Eigenständige Analyse

- **Lies die komplette `.github/copilot-instructions.md`** - ALLE Richtlinien, Best Practices und Workflow-Anforderungen müssen vollständig berücksichtigt werden
- **Lies die `TESTING.md`** - Verstehe die Test-Struktur, Best Practices und Richtlinien
- **Installiere Dependencies**: `npm install` (KRITISCH - muss als erstes ausgeführt werden in einem frischen Clone)
- **Etabliere Baseline**: Führe `npm run test` aus um aktuellen Test-Status zu verstehen

### 2. Eigenständige Test-Gap-Analyse - KRITISCH

**WICHTIG**: Du musst **selbst identifizieren**, welche Tests fehlen. Der User gibt NICHT vor, was zu testen ist.

#### 2.1 Test-Coverage-Analyse

```bash
# Generiere Coverage-Report
npm run test:coverage

# Analysiere Coverage-Report in coverage/
# Identifiziere Dateien mit niedriger Coverage (<80%)
```

#### 2.2 Code-Struktur-Analyse

Durchsuche das Projekt nach Code **ohne** zugehörige Tests:

```bash
# Finde alle Quellcode-Dateien
find src helpers -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.ts" ! -name "*.test.tsx" ! -name "*.d.ts"

# Prüfe für jede Datei, ob eine entsprechende .test.ts(x) Datei existiert
# Beispiel: src/utils/example.ts sollte src/utils/example.test.ts haben
```

#### 2.3 Funktionalitäts-Analyse

Analysiere **jede Kategorie** systematisch und identifiziere fehlende Tests:

**A. Helper-Funktionen (helpers/)**

- Prüfe JEDE Datei in helpers/ auf zugehörige .test.ts Dateien
- Identifiziere Funktionen ohne Test-Coverage
- Fokus auf finanzielle Berechnungen:
  - Steuerberechnung (Vorabpauschale, Freibetrag, Kapitalertragsteuer)
  - Entnahme-Strategien (4% Rule, 3% Rule, Variable, Monthly Fixed)
  - Zinseszins-Berechnungen
  - Monte Carlo-Simulationen
  - Rendite-Konfigurationen (Fixed, Random, Variable)

**B. Utility-Funktionen (src/utils/)**

- Array-Manipulationen
- Zufallszahlen-Generierung
- Formatierungs-Funktionen (Währung, Prozente, Datum)
- ID-Generierung (unique-id.ts)
- Berechnungs-Utilities

**C. React-Komponenten (src/components/)**

- UI-Komponenten ohne Tests
- Custom Hooks (use*.ts) ohne Tests
- Event-Handler und User-Interaktionen
- Edge Cases in Formularen
- State-Management in Komponenten

**D. Integration-Tests**

- End-to-End User-Workflows
- Komponenten-Interaktionen
- Daten-Flow zwischen Komponenten
- Tab-Switching und Navigation
- Modal-Interaktionen

**E. Edge Cases und Error Handling**

- Null/Undefined-Handling
- Leere Arrays/Objekte
- Ungültige Eingaben (negative Zahlen, zu große/kleine Werte)
- Division durch Null
- Out-of-Range Werte (z.B. Jahre, Prozente)
- Browser-Kompatibilität

**F. Performance und Stability**

- Monte Carlo mit verschiedenen Seeds
- Große Datenmengen (viele Jahre, viele Simulationen)
- Speicher-Leaks in Komponenten
- Re-Render-Optimierungen (useMemo, useCallback)

#### 2.4 Dokumentiere Findings

Erstelle eine Liste der identifizierten Test-Lücken:

```markdown
## Test-Lücken-Analyse

### Kritische Lücken (High Priority)
1. [Datei/Funktion] - [Beschreibung der fehlenden Tests]
2. ...

### Wichtige Lücken (Medium Priority)
1. [Datei/Funktion] - [Beschreibung der fehlenden Tests]
2. ...

### Optionale Verbesserungen (Low Priority)
1. [Datei/Funktion] - [Beschreibung der fehlenden Tests]
2. ...
```

### 3. Planung und Reporting

- **Erstelle einen detaillierten Plan** mit `report_progress` als Checkliste mit 3-8 Teilschritten
- **Priorisiere Tests** nach Impact und Kritikalität:
  - High Priority: Finanzielle Berechnungen, Kern-Funktionalität
  - Medium Priority: UI-Komponenten, Helper-Funktionen
  - Low Priority: Edge Cases, Performance-Tests
- **Orientiere dich an**: Step-by-Step Development Approach (Teilschritt commits) aus copilot-instructions.md
- **Jeder Schritt sollte sein**: Fokussiert, unabhängig testbar, minimal invasiv

### 4. Implementierung (Für jeden Teilschritt)

**Development Phase:**

- Implementiere **Tests für einen fokussierten Bereich** pro Schritt
- Folge Test-Patterns aus `TESTING.md`:
  - Arrange-Act-Assert Pattern
  - Aussagekräftige Test-Namen
  - Umfassende Edge Cases
  - Mocke externe Dependencies (fetch, localStorage, etc.)
- **Test-Typen berücksichtigen**:
  - **Unit-Tests**: Einzelne Funktionen isoliert testen
  - **Komponenten-Tests**: React-Komponenten mit React Testing Library
  - **Integration-Tests**: Zusammenspiel mehrerer Module/Komponenten
- **Fokus auf deutsche Finanz-Logik**:
  - Steuerberechnungen müssen exakt sein
  - Währungsformatierung (1.234,56 €)
  - Datumsformatierung (deutsches Format)

**Testing & Linting Phase - VERPFLICHTEND:**

- **npm install** muss ausgeführt worden sein (check for `node_modules/`)
- **npm run test** - ALLE neuen Tests müssen bestehen
  - Neue Tests müssen die Coverage erhöhen
  - Bestehende Tests dürfen nicht brechen
- **npm run lint** - Muss mit 0 Warnings bestehen
- **npm run typecheck** - Erwarte minimale oder keine Fehler
- **npm run build** - Muss erfolgreich abschließen
- **Bei Fehlern**: Zurück zur Development Phase

**Individual Step Commit:**

- **Nutze `report_progress`** nach jedem abgeschlossenen Teilschritt
- **Update die Checklist** - Markiere den aktuellen Schritt als erledigt
- **Klare Commit Message** - Beschreibe welche Tests hinzugefügt wurden
- **Review committed files** - Stelle sicher nur Test-Dateien committed werden

**Step Validation:**

- **Coverage prüfen**: Verifiziere dass Coverage gestiegen ist
- **Test Quality**: Stelle sicher Tests sind aussagekräftig (nicht nur Coverage-Boost)
- **Test alle Edge Cases**: Null, Undefined, leere Arrays, ungültige Eingaben
- **Reproduzierbarkeit**: Tests müssen deterministisch sein (feste Seeds für Random)

### 5. Final Review

- **Code Review durchführen** gemäß Code Review Guidelines in copilot-instructions.md
- **Coverage-Ziele erreicht**:
  - Statements: > 80%
  - Branches: > 75%
  - Functions: > 80%
  - Lines: > 80%
- **Test-Qualität validieren**:
  - Alle Tests bestehen (`npm run test`)
  - Tests sind deterministisch (keine Flaky Tests)
  - Edge Cases sind abgedeckt
  - Test-Namen sind aussagekräftig
  - Mocks sind korrekt implementiert

## ⚠️ Kritische Anforderungen

### Test-Identifikation - EIGENSTÄNDIG

- **KEINE Vorgaben vom User** - Du musst selbst analysieren welche Tests fehlen
- **Systematische Analyse** - Durchsuche ALLE relevanten Dateien und Funktionen
- **Coverage-basiert** - Nutze Coverage-Report als Leitfaden
- **Funktionalitäts-basiert** - Analysiere Code-Struktur und identifiziere ungetestete Bereiche
- **Priorisierung** - Konzentriere dich zuerst auf kritische Bereiche (finanzielle Berechnungen)

### Test-Qualität

- **Aussagekräftige Tests** - Tests müssen echte Fehler finden können
- **Nicht nur Coverage** - Fokus auf Qualität, nicht nur Quantität
- **Edge Cases abdecken** - Null, Undefined, Grenzwerte, ungültige Eingaben
- **Deterministisch** - Keine Flaky Tests (feste Seeds für Random-Tests)
- **Isoliert** - Jeder Test läuft unabhängig

### Test-Typen

Implementiere ALLE relevanten Test-Typen:

1. **Unit-Tests** - Einzelne Funktionen isoliert
2. **Komponenten-Tests** - React-Komponenten mit React Testing Library
3. **Integration-Tests** - Zusammenspiel mehrerer Komponenten
4. **Edge-Case-Tests** - Grenzwerte und Fehlerszenarien
5. **Regression-Tests** - Bekannte Bugs dürfen nicht wieder auftreten

### Code Quality

- **KEINE eslint-disable Kommentare** - Fixe das zugrunde liegende Problem
- **Folge TESTING.md Best Practices** - Arrange-Act-Assert, Test-Isolierung, etc.
- **Mock externe Dependencies** - fetch, localStorage, Vercel Analytics, etc.
- **Timeout-Management** - Explizite Timeouts für langsame Tests

### Development Workflow

- **Step-by-step commits (Teilschritt commits)** - Jeder Test-Bereich wird individuell committed
- **report_progress nach jedem Schritt** - Fortschritt regelmäßig dokumentieren
- **Minimale Änderungen pro Step** - Fokussierte Test-Implementierung

## 🔍 Test-Analyse-Strategien

### Strategie 1: Coverage-gesteuert

```bash
# 1. Generiere Coverage-Report
npm run test:coverage

# 2. Öffne coverage/index.html (oder prüfe Console-Output)
# 3. Identifiziere Dateien mit <80% Coverage
# 4. Analysiere nicht-abgedeckte Zeilen in diesen Dateien
# 5. Schreibe Tests für diese spezifischen Bereiche
```

### Strategie 2: Datei-Struktur-gesteuert

```bash
# 1. Liste alle Source-Dateien
find src helpers -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" ! -name "*.d.ts"

# 2. Für jede Datei: Prüfe ob .test.ts(x) existiert
# Beispiel: src/utils/currency.ts -> src/utils/currency.test.ts sollte existieren

# 3. Erstelle fehlende Test-Dateien
# 4. Implementiere Tests für alle exportierten Funktionen/Komponenten
```

### Strategie 3: Funktionalitäts-gesteuert

Systematische Analyse nach Kategorien:

1. **Finanzielle Berechnungen** (Höchste Priorität)
   - Alle Funktionen in helpers/ durchgehen
   - Jede Export-Funktion benötigt Tests
   - Edge Cases für finanzielle Berechnungen kritisch

2. **UI-Komponenten** (Mittlere Priorität)
   - Jede Komponente in src/components/
   - User-Interaktionen testen (clicks, inputs, form submissions)
   - State-Changes testen

3. **Utilities** (Mittlere Priorität)
   - src/utils/ durchgehen
   - Formatierung, Validierung, Transformationen testen

4. **Integration** (Niedrigere Priorität, aber wichtig)
   - End-to-End User-Flows
   - Komponenten-Zusammenspiel

## 🎯 Test-Kategorien und Beispiele

### 1. Finanzielle Berechnungen (KRITISCH)

```typescript
// helpers/steuer.test.ts
describe('Vorabpauschale', () => {
  it('should calculate Vorabpauschale correctly for positive returns', () => {
    // Test mit typischen Werten
  })
  
  it('should return 0 for negative returns', () => {
    // Edge Case: Verlustjahre
  })
  
  it('should handle Basiszins changes correctly', () => {
    // Test mit verschiedenen Basiszins-Werten
  })
  
  it('should respect Freibetrag limit', () => {
    // Test dass Freibetrag korrekt berücksichtigt wird
  })
})
```

### 2. UI-Komponenten

```typescript
// src/components/MyComponent.test.tsx
describe('MyComponent', () => {
  it('renders with default props', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user input correctly', async () => {
    render(<MyComponent />)
    const input = screen.getByLabelText('Input Label')
    
    await userEvent.type(input, '12345')
    
    expect(input).toHaveValue('12345')
  })
  
  it('calls callback on button click', async () => {
    const onClickMock = vi.fn()
    render(<MyComponent onClick={onClickMock} />)
    
    await userEvent.click(screen.getByRole('button'))
    
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })
})
```

### 3. Custom Hooks

```typescript
// src/hooks/useMyHook.test.ts
import { renderHook } from '@testing-library/react'

describe('useMyHook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useMyHook())
    
    expect(result.current.value).toBe(defaultValue)
  })
  
  it('should update value correctly', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.setValue(newValue)
    })
    
    expect(result.current.value).toBe(newValue)
  })
})
```

### 4. Integration-Tests

```typescript
// src/integration/user-workflow.test.tsx
describe('Complete User Workflow', () => {
  it('should allow user to create savings plan and see results', async () => {
    render(<App />)
    
    // 1. Eingabe der Sparplandaten
    await userEvent.type(screen.getByLabelText('Monatlicher Betrag'), '2000')
    
    // 2. Rendite einstellen
    const slider = screen.getByRole('slider', { name: /rendite/i })
    await userEvent.type(slider, '5')
    
    // 3. Überprüfe dass Berechnung aktualisiert wird
    await waitFor(() => {
      expect(screen.getByText(/Endkapital/i)).toBeInTheDocument()
    })
  })
})
```

## 📚 Referenzen

- **Vollständiger Workflow**: Siehe `.github/copilot-instructions.md` (VOLLSTÄNDIG LESEN)
- **Test-Best-Practices**: Siehe `TESTING.md` (VOLLSTÄNDIG LESEN)
- **Vitest Dokumentation**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **Jest DOM Matchers**: https://github.com/testing-library/jest-dom

## 🎓 Wichtige Entwicklungsprinzipien

1. **Eigenständige Analyse** - DU identifizierst fehlende Tests, nicht der User
2. **Systematisches Vorgehen** - Coverage-Report + Datei-Struktur + Funktionalität
3. **Qualität über Quantität** - Tests müssen echte Fehler finden können
4. **Edge Cases beachten** - Null, Undefined, Grenzwerte, ungültige Eingaben
5. **Deutsche Finanz-Logik** - Steuerberechnungen müssen exakt sein
6. **Deterministisch** - Keine Flaky Tests (feste Seeds für Random)
7. **Isoliert** - Jeder Test läuft unabhängig

## ✅ Erfolgs-Kriterien

Nach erfolgreicher Test-Implementierung sollte gelten:

- ✅ **Eigenständige Identifikation**: Du hast selbst analysiert welche Tests fehlen
- ✅ **Coverage-Ziele erreicht**: Statements >80%, Branches >75%, Functions >80%, Lines >80%
- ✅ **Alle Tests bestehen**: `npm run test` zeigt 100% Pass-Rate
- ✅ **Linting ist fehlerfrei**: `npm run lint` mit 0 Warnings
- ✅ **Build funktioniert**: `npm run build` erfolgreich
- ✅ **Test-Qualität**: Tests sind aussagekräftig, nicht nur Coverage-Boost
- ✅ **Edge Cases abgedeckt**: Null, Undefined, Grenzwerte getestet
- ✅ **Deterministisch**: Keine Flaky Tests
- ✅ **Dokumentiert**: Klare Commit-Messages für jeden Test-Bereich
- ✅ **Integration getestet**: User-Workflows funktionieren

## 🔄 Workflow-Zusammenfassung

1. **Analysiere eigenständig** welche Tests fehlen (Coverage + Datei-Struktur + Funktionalität)
2. **Priorisiere** nach Kritikalität (Finanzberechnungen > UI > Utilities)
3. **Plane detailliert** mit `report_progress` (3-8 Schritte)
4. **Implementiere schrittweise** - Ein fokussierter Bereich pro Schritt
5. **Teste nach jedem Schritt** - npm run test muss bestehen
6. **Committe nach jedem Schritt** - report_progress mit klarer Message
7. **Final Review** - Coverage-Ziele, Test-Qualität, keine Flaky Tests

**WICHTIG**: Der Erfolg dieses Issues misst sich daran, wie gut du **eigenständig** die Test-Lücken identifiziert und geschlossen hast.
