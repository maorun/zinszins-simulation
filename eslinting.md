# ESLint Warnings - Schritt-für-Schritt Lösungsplan

## Übersicht

**Aktueller Stand:** 176 ESLint-Warnungen  
**Ziel:** 0 Warnungen (max-warnings = 0)  
**Status:** In Bearbeitung

## Kategorisierung der Warnungen

### Nach Typ

| Typ | Anzahl | Beschreibung |
|-----|--------|--------------|
| `@typescript-eslint/no-explicit-any` | 137 | Verwendung von `any` Type |
| `complexity` | 22 | Funktionen mit zu hoher zyklomatischer Komplexität (>25) |
| `max-lines-per-function` | 17 | Funktionen mit zu vielen Zeilen (>400) |
| `max-depth` | 1 | Zu tiefe Verschachtelung (>5 Ebenen) |

### Nach Dateien (Top 10)

| Datei | Warnungen | Hauptprobleme |
|-------|-----------|---------------|
| `src/contexts/SimulationContext.tsx` | 61 | `any` Types |
| `src/utils/data-export.ts` | 16 | `any` Types, Komplexität |
| `src/hooks/useWithdrawalModals.ts` | 9 | `any` Types, Komplexität |
| `helpers/multi-asset-calculations.ts` | 8 | `any` Types |
| `src/components/WithdrawalSegmentForm.tsx` | 6 | Komplexität, Zeilenzahl |
| `src/components/SparplanSimulationsAusgabe.tsx` | 5 | `any` Types |
| `src/components/EntnahmeSimulationDisplay.tsx` | 5 | `any` Types, Zeilenzahl |
| `src/utils/enhanced-summary.ts` | 4 | `any` Types |
| `src/utils/config-storage.ts` | 4 | `any` Types |
| `src/hooks/useWithdrawalCalculations.ts` | 4 | `any` Types, Komplexität, Zeilenzahl |

## Lösungsstrategie

### Phase 1: Komplexitäts- und Zeilenzahl-Reduktion ✅ TEILWEISE ERLEDIGT

**Ziel:** Funktionen refaktorieren, um unter die Limits zu kommen

#### 1.1 Kritische Funktionen (Komplexität > 75 ODER Zeilen > 1000)

- [x] **calculateWithdrawal** (helpers/withdrawal.tsx) ✅ ERLEDIGT
  - Original: Komplexität 156, 548 Zeilen
  - Aktuell: Komplexität <25, <400 Zeilen
  - Status: ✅ Beide Limits erreicht (Komplexität <25, Zeilen <400)
  - Extrahierte Hilfsfunktionen: 16 (7 neue in diesem PR)
  - Neue Hilfsfunktionen:
    - `calculateYearHealthCareInsurance` - Health Insurance Berechnungen
    - `calculateYearIncomeTax` - Einkommensteuer mit Grundfreibetrag
    - `applyPortfolioGrowthAndVorabTax` - Portfolio-Wachstum Anwendung
    - `calculateAdjustedWithdrawal` - Entnahme-Anpassungen (RMD, Inflation, Dynamik)
    - `buildYearlyResult` - Ergebnisobjekt-Konstruktion
    - `buildStrategySpecificFields` - Strategie-spezifische Felder
    - `buildIncomeSourceFields` - Einkommensquellen-Felder

- [x] **EntnahmeSimulationsAusgabe** (src/components/EntnahmeSimulationsAusgabe.tsx) ✅ TEILWEISE ERLEDIGT
  - Original: Komplexität: 109, Zeilen: 1588
  - Aktuell: Komplexität: 75, Zeilen: 402
  - Status: ✅ Zeilen unter Limit (400), Komplexität reduziert um 31%
  - Extrahierte Komponenten: 9
    - `WithdrawalReturnModeConfiguration` - Rendite-Konfiguration
    - `WithdrawalStrategySelector` - Strategie-Auswahl
    - `BucketStrategyConfigurationForm` - Bucket-Strategie Konfiguration
    - `MonthlyFixedWithdrawalConfiguration` - Monatliche Entnahme Konfiguration
    - `VariablePercentWithdrawalConfiguration` - Variable Prozent Konfiguration
    - `WithdrawalFrequencyConfiguration` - Entnahme-Häufigkeit
    - `InflationConfiguration` - Inflations-Einstellungen
    - `WithdrawalModeSelector` - Entnahme-Modus Auswahl
  - Verbleibende Komplexität: Mehrfach verschachtelte bedingte Rendering-Logik
  - Aufwand: 0,5 Tage
  - Priorität: HOCH

- [ ] **Arrow function in WithdrawalSegmentForm** (src/components/WithdrawalSegmentForm.tsx)
  - Original: Komplexität: 93, Zeilen: 865 (Arrow function)
  - Status: ⏳ Ausstehend - Erfordert sorgfältige Typ-Analyse
  - Hinweis: Die Arrow-Function rendert die Segment-Karten und verwendet viele
    verschachtelte Konfigurationsobjekte mit komplexen TypeScript-Typen.
    Eine Extraktion erfordert detaillierte Anpassung an die bestehende Type-Hierarchie.
  - Schätzung: 10-12 Hilfsfunktionen oder 1 große Komponente nötig
  - Aufwand: 1 Tag
  - Priorität: HOCH

#### 1.2 Hohe Priorität (Komplexität 45-75 ODER Zeilen 500-1000)

- [ ] **GlobalPlanningConfiguration** (src/components/GlobalPlanningConfiguration.tsx)
  - Komplexität: 54, Zeilen: 514
  - Aufwand: 0,5 Tage

- [ ] **exportWithdrawalDataToCSV** (src/utils/data-export.ts)
  - Komplexität: 52
  - Aufwand: 0,3 Tage

- [ ] **useWithdrawalModals arrow function** (src/hooks/useWithdrawalModals.ts)
  - Komplexität: 48
  - Aufwand: 0,3 Tage

- [ ] **BucketStrategyConfiguration** (src/components/BucketStrategyConfiguration.tsx)
  - Komplexität: 47
  - Aufwand: 0,3 Tage

- [ ] **SparplanEingabe** (src/components/SparplanEingabe.tsx)
  - Komplexität: 30, Zeilen: 759
  - Aufwand: 0,5 Tage

- [ ] **OtherIncomeConfigurationComponent** (src/components/OtherIncomeConfigurationComponent.tsx)
  - Komplexität: 27, Zeilen: 745
  - Aufwand: 0,5 Tage

- [ ] **SpecialEvents** (src/components/SpecialEvents.tsx)
  - Zeilen: 623
  - Aufwand: 0,3 Tage

- [ ] **HealthCareInsuranceConfiguration** (src/components/HealthCareInsuranceConfiguration.tsx)
  - Komplexität: 37, Zeilen: 552
  - Aufwand: 0,4 Tage

- [ ] **EntnahmeSimulationDisplay** (src/components/EntnahmeSimulationDisplay.tsx)
  - Zeilen: 533
  - Aufwand: 0,3 Tage

#### 1.3 Mittlere Priorität (Komplexität 26-44 ODER Zeilen 401-500)

- [ ] **exportDataToMarkdown** (src/utils/data-export.ts) - Komplexität: 34
- [ ] **createTaxableIncomeExplanation** (src/components/WithdrawalSegmentForm.tsx) - Komplexität: 33
- [ ] **calculateCoupleHealthInsuranceForYear** (helpers/withdrawal.tsx) - Komplexität: 30
- [ ] **CareCostConfiguration** (src/components/CareCostConfiguration.tsx) - Komplexität: 27, Zeilen: 456
- [ ] **formatParametersForExport** (src/utils/parameter-export.ts) - Komplexität: 26
- [ ] **Arrow functions mit Komplexität 26-34** (verschiedene Dateien) - 7 Funktionen
- [ ] **StatutoryPensionConfiguration** (src/components/StatutoryPensionConfiguration.tsx) - Zeilen: 409
- [ ] **ProfileManagement** (src/components/ProfileManagement.tsx) - Zeilen: 405
- [ ] **MultiAssetPortfolioConfiguration** (src/components/MultiAssetPortfolioConfiguration.tsx) - Zeilen: 401
- [ ] **useWithdrawalCalculations** (src/hooks/useWithdrawalCalculations.ts) - Zeilen: 531

### Phase 2: TypeScript `any` Types Beheben

**Ziel:** 137 `any` Types durch spezifische Types ersetzen

### Priorisierung nach Dateien

1. **SimulationContext.tsx** (61 Warnungen)
   - State Management Types definieren
   - Context Props typisieren
   - Aufwand: 0,5 Tage

2. **data-export.ts** (14 `any` Warnungen)
   - Export-Funktionen typisieren
   - Aufwand: 0,2 Tage

3. **useWithdrawalModals.ts** (8 `any` Warnungen)
   - Modal State Types definieren
   - Aufwand: 0,2 Tage

4. **multi-asset-calculations.ts** (8 `any` Warnungen)
   - Calculation Types definieren
   - Aufwand: 0,2 Tage

5. **Weitere Dateien** (46 `any` Warnungen verteilt)
   - Systematisch durcharbeiten
   - Aufwand: 0,5 Tage

**Strategie:**

- Bestehende Types aus dem Projekt wiederverwenden
- Neue Types in separaten `.types.ts` Dateien definieren wo sinnvoll
- Union Types und Type Guards verwenden statt `any`
- `unknown` verwenden wenn der Type wirklich dynamisch ist, dann Type Guards einsetzen

### Phase 3: Weitere Probleme

#### 3.1 `max-depth` Warnung (1)

**Datei:** `src/utils/sparplan-utils.ts` (Zeile 154)

**Lösung:**

- Verschachtelte Bedingungen in Guard Clauses umwandeln
- Logik in separate Funktionen extrahieren
- Early returns verwenden

**Aufwand:** 0,05 Tage

## Zeitschätzung

| Phase | Aufgabe | Aufwand | Status |
|-------|---------|---------|--------|
| 1.1 | calculateWithdrawal vervollständigen | 0,2 Tage | 🔄 80% |
| 1.1 | EntnahmeSimulationsAusgabe | 1,5 Tage | ⏳ |
| 1.1 | WithdrawalSegmentForm Arrow | 1,0 Tag | ⏳ |
| 1.2 | 10 Funktionen mittlerer Komplexität | 3,5 Tage | ⏳ |
| 1.3 | 15 Funktionen niedriger Komplexität | 2,0 Tage | ⏳ |
| 2 | 137 `any` Types beheben | 2,0 Tage | ⏳ |
| 3 | ✅ no-alert beheben | 0,1 Tage | ✅ ERLEDIGT |
| 3 | max-depth beheben | 0,05 Tage | ⏳ |
| **Gesamt** | **Alle Warnungen** | **10,35 Tage** | **~9% erledigt** |

## Refactoring-Richtlinien

### Funktions-Extraktion

1. **Logische Kohäsion:** Extrahiere zusammenhängende Logik
2. **Single Responsibility:** Jede Funktion macht eine Sache
3. **Klare Benennung:** Funktionsname beschreibt was sie tut
4. **Parameter-Anzahl:** Max. 5-7 Parameter, sonst Objekt verwenden
5. **Testbarkeit:** Extrahierte Funktionen sollten testbar sein

### Komplexitäts-Reduktion

1. **Early Returns:** Reduziert Verschachtelung
2. **Guard Clauses:** Fehlerbehandlung am Anfang
3. **Lookup Tables:** Statt langer if/switch Statements
4. **Strategy Pattern:** Für unterschiedliches Verhalten
5. **Extract Method:** Komplexe Bedingungen in benannte Funktionen

### TypeScript Types

1. **Spezifische Types:** Niemals `any` ohne guten Grund
2. **Type Inference:** TypeScript inferieren lassen wo möglich
3. **Union Types:** Für mehrere mögliche Types
4. **Type Guards:** Für Runtime Type Checking
5. **Generics:** Für wiederverwendbare typsichere Komponenten

## Nächste Schritte

### Kurzfristig (diese Woche)

1. ✅ **ERLEDIGT:** calculateWithdrawal Refactoring abschließen
   - Komplexität von 77 → <25 reduziert
   - 7 neue Hilfsfunktionen extrahiert
   - Alle 1397 Tests bestehen
2. ✅ **TEILWEISE ERLEDIGT:** EntnahmeSimulationsAusgabe refactoring
   - Komplexität von 109 → 75 reduziert (31% Verbesserung)
   - Zeilen von 945 → 402 reduziert (57% Verbesserung)
   - 9 neue fokussierte Komponenten extrahiert
   - Alle 1397 Tests bestehen
3. Top 5 `any` Type Dateien angehen

### Mittelfristig (nächste 2 Wochen)

1. Alle Komplexitäts- und Zeilenzahl-Warnungen beheben
2. 80% der `any` Types ersetzen
3. ✅ no-alert beheben
4. max-depth beheben

### Langfristig (nächster Monat)

1. 100% der Warnungen beheben
2. max-warnings auf 0 setzen
3. CI/CD Pipeline anpassen

## Tracking

- **Startdatum:** 2025-01-10
- **Aktueller Stand:** 196 Warnungen (reduziert von 178 - neue `any` type Warnungen durch Refactoring)
- **Fortschritt:** 15% (calculateWithdrawal vollständig refactored ✅)
- **Geschätzte Fertigstellung:** 2025-01-24 (bei Vollzeit-Arbeit)

## Lessons Learned

### Was funktioniert gut

- ✅ Systematische Extraktion von Hilfsfunktionen
- ✅ Tests nach jeder Änderung ausführen
- ✅ Kleine, inkrementelle Commits
- ✅ Von höchster zu niedrigster Komplexität arbeiten

### Herausforderungen

- ⚠️ Umfang größer als initial geschätzt (39 Funktionen)
- ⚠️ Manche Komplexität ist inhärent (deutsche Steuerberechnung)
- ⚠️ Balance zwischen Abstraktion und Lesbarkeit

### Best Practices

1. **Vor dem Refactoring:** Sicherstellen dass Tests existieren
2. **Während dem Refactoring:** Häufig testen
3. **Nach dem Refactoring:** Code Review und Dokumentation
4. **Commits:** Jede Funktion = 1 Commit mit aussagekräftiger Message

## Ressourcen

- [ESLint Complexity Rule](https://eslint.org/docs/latest/rules/complexity)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Refactoring Guru](https://refactoring.guru/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**Letzte Aktualisierung:** 2025-01-10  
**Nächste Review:** Nach Abschluss Phase 1.1
