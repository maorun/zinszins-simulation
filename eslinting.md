# ESLint Warnings - Schritt-für-Schritt Lösungsplan

## Übersicht

**Aktueller Stand:** 84 ESLint-Warnungen (reduziert von 144)
**Ziel:** 0 Warnungen (max-warnings = 0)
**Status:** In Bearbeitung

## Kategorisierung der Warnungen

### Nach Typ

| Typ | Anzahl | Beschreibung |
|-----|--------|--------------|
| `@typescript-eslint/no-explicit-any` | 66 | Verwendung von `any` Type |
| `complexity` | 6 | Funktionen mit zu hoher zyklomatischer Komplexität (>25) |
| `max-lines-per-function` | 12 | Funktionen mit zu vielen Zeilen (>400) |
| `max-depth` | 0 | ✅ Zu tiefe Verschachtelung (>5 Ebenen) - ERLEDIGT |

### Nach Dateien (Top 10)

| Datei | Warnungen | Hauptprobleme |
|-------|-----------|---------------|
| `src/contexts/SimulationContext.tsx` | 61 | `any` Types |
| `src/hooks/useWithdrawalModals.ts` | 9 | `any` Types, Komplexität |
| `helpers/multi-asset-calculations.ts` | 8 | `any` Types |
| `src/components/WithdrawalSegmentForm.tsx` | 6 | Komplexität, Zeilenzahl |
| `src/components/SparplanSimulationsAusgabe.tsx` | 5 | `any` Types |
| `src/components/EntnahmeSimulationDisplay.tsx` | 5 | `any` Types, Zeilenzahl |
| `src/utils/enhanced-summary.ts` | 4 | `any` Types |
| `src/utils/config-storage.ts` | 4 | `any` Types |
| `src/hooks/useWithdrawalCalculations.ts` | 4 | `any` Types, Komplexität, Zeilenzahl |
| `src/utils/data-export.ts` | 0 | ✅ ERLEDIGT - Alle `any` types behoben |

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

- [x] **Arrow function in WithdrawalSegmentForm** (src/components/WithdrawalSegmentForm.tsx) ✅ ERLEDIGT
  - Original: Komplexität: 93, Zeilen: 865 (Arrow function)
  - Aktuell: Komplexität: <8, Zeilen: 14 (Arrow function jetzt eine einfache Component-Map)
  - Status: ✅ Beide Limits erreicht - Arrow function extrahiert in WithdrawalSegmentCard
  - Extrahierte Komponenten: 1 Hauptkomponente + 17 Hilfskomponenten
    - `WithdrawalSegmentCard` - Vollständige Segment-Karte (108 Zeilen, Komplexität <8) ✅ WEITER REFACTORED
    - `SegmentCardHeader` - Segment Card Header mit Aktionen (91 Zeilen, Komplexität <8)
    - `SegmentBasicConfig` - Basis-Konfiguration (Name, Jahre) (69 Zeilen, Komplexität <8)
    - `SegmentTaxReductionConfig` - Steuer-Reduktion Einstellung (35 Zeilen, Komplexität <8)
    - `SegmentStrategyConfig` - Strategie-spezifische Konfiguration Router (57 Zeilen, Komplexität <8)
    - `SegmentDynamicStrategyWrapper` - Wrapper für dynamische Strategie (46 Zeilen, Komplexität <8)
    - `SegmentBucketStrategyWrapper` - Wrapper für Bucket Strategie (61 Zeilen, Komplexität <8)
    - `SegmentRMDStrategyWrapper` - Wrapper für RMD Strategie (39 Zeilen, Komplexität <8)
    - `SegmentSteueroptimierteWrapper` - Wrapper für steueroptimierte Strategie (64 Zeilen, Komplexität <8)
    - `VariablePercentWithdrawalConfig` - Variable Prozent Einstellungen (38 Zeilen)
    - `MonthlyWithdrawalConfig` - Monatliche Entnahme Konfiguration (89 Zeilen)
    - `WithdrawalFrequencyConfig` - Entnahme-Häufigkeit (37 Zeilen)
    - `SegmentInflationConfig` - Inflations-Konfiguration (62 Zeilen)
    - `SegmentFixedReturnConfig` - Feste Rendite (39 Zeilen)
    - `SegmentRandomReturnConfig` - Zufällige Rendite mit Seed (135 Zeilen)
    - `SegmentVariableReturnConfig` - Variable Renditen pro Jahr (78 Zeilen)
    - `SegmentReturnConfiguration` - Rendite-Modus Auswahl (139 Zeilen)
    - `SegmentStrategySelector` - Strategie-Auswahl mit Defaults (66 Zeilen)
  - Extrahierte Hilfsfunktionen: 1
    - `withdrawal-strategy-defaults.ts` - Strategie-Standardwerte (98 Zeilen, Komplexität ~6)
  - WithdrawalSegmentForm reduziert: 1128 → 172 Zeilen (85% Reduktion)
  - WithdrawalSegmentCard refactored: 1009 → 108 Zeilen (89% Reduktion)
  - Alle 1462 Tests bestehen
  - ESLint Warnungen reduziert: 155 → 150
  - Aufwand: 1,5 Tage
  - Priorität: HOCH ✅ KOMPLETT ERLEDIGT

#### 1.2 Hohe Priorität (Komplexität 45-75 ODER Zeilen 500-1000)

- [x] **GlobalPlanningConfiguration** (src/components/GlobalPlanningConfiguration.tsx) ✅ ERLEDIGT
  - Original: Komplexität 54, Zeilen: 514
  - Aktuell: Komplexität <25, Zeilen: 185
  - Status: ✅ Beide Limits erreicht (Komplexität <25, Zeilen <400)
  - Extrahierte Komponenten: 6
    - `PlanningModeSelector` - Auswahl zwischen Einzelperson/Ehepaar
    - `GenderConfiguration` - Geschlechtskonfiguration für Individual/Paar
    - `BirthYearConfiguration` - Geburtsjahr-Eingabe für Individual/Paar
    - `LifeExpectancyCalculation` - Lebensende-Berechnung (Hauptkomponente)
    - `AutomaticCalculationHelper` - Automatische Berechnungshilfe
    - `LifeExpectancyTableConfiguration` - Sterbetafel-Konfiguration
  - Aufwand: 0,5 Tage

- [x] **exportWithdrawalDataToCSV** (src/utils/data-export.ts) ✅ ERLEDIGT
  - Original: Komplexität: 52, Zeilen: 158
  - Aktuell: Komplexität <25, Zeilen: 31
  - Status: ✅ Beide Limits erreicht (Komplexität <25, Zeilen <50)
  - Extrahierte Hilfsfunktionen: 5
    - `generateWithdrawalMetadataLines` - CSV Metadaten-Generierung
    - `generateWithdrawalCSVHeaders` - CSV Header-Generierung mit bedingten Spalten
    - `buildBasicRowData` - Basis-Zeilendaten (Jahr, Monat, Kapital, Steuern)
    - `addStrategySpecificData` - Strategie-spezifische Felder
    - `addTaxAndIncomeData` - Steuer- und Einkommensdaten
  - Alle Hilfsfunktionen mit Params-Objekten für >5 Parameter
  - Aufwand: 0,3 Tage

- [x] **useWithdrawalModals arrow function** (src/hooks/useWithdrawalModals.ts) ✅ ERLEDIGT
  - Original: Komplexität: 48, Zeilen: 202
  - Aktuell: Komplexität: <8, Zeilen: 119
  - Status: ✅ Beide Limits erreicht (Komplexität <8, Zeilen <400)
  - Extrahierte Hilfsfunktionen: 10
    - `findApplicableSegment` - Segment-Finder für Jahr
    - `handleInflationExplanation` - Inflations-Erklärung
    - `handleInterestExplanation` - Zins-Erklärung
    - `handleTaxExplanation` - Steuer-Erklärung
    - `handleIncomeTaxExplanation` - Einkommensteuer-Erklärung
    - `handleTaxableIncomeExplanation` - Zu versteuerndes Einkommen
    - `handleOtherIncomeExplanation` - Sonstige Einkünfte
    - `handleStatutoryPensionExplanation` - Gesetzliche Rente
    - `handleEndkapitalExplanation` - Endkapital-Erklärung
    - `handleHealthCareInsuranceExplanation` - Krankenversicherung
  - Alle Hilfsfunktionen mit Params-Objekten für >5 Parameter
  - 24 neue Tests für alle Hilfsfunktionen
  - Shared Types File erstellt (useWithdrawalModals.types.ts)
  - Alle `any` Types durch spezifische Types ersetzt
  - Aufwand: 0,3 Tage

- [x] **BucketStrategyConfiguration** (src/components/BucketStrategyConfiguration.tsx) ✅ ERLEDIGT
  - Original: Komplexität 47, Zeilen: 472
  - Aktuell: Komplexität <8, Zeilen: 154
  - Status: ✅ Beide Limits erreicht (Komplexität <8, Zeilen <400)
  - Extrahierte Komponenten: 9
    - `SubStrategySelector` - Sub-Strategie Auswahl
    - `VariabelProzentConfig` - Variable Prozent Konfiguration
    - `MonatlichFestConfig` - Monatlich Fest Konfiguration
    - `DynamischConfig` - Dynamische Strategie Konfiguration
    - `BasisrateSlider` - Basis-Entnahmerate Slider
    - `ObereControls` - Obere Renditeschwelle und Anpassung
    - `UntereControls` - Untere Renditeschwelle und Anpassung
    - `InitialCashCushionConfig` - Initiales Cash-Polster
    - `RefillThresholdConfig` - Auffüll-Schwellenwert
    - `RefillPercentageConfig` - Auffüll-Anteil
  - Extrahierte Hilfsfunktionen: 5
    - `getDefaultValues` - Standardwerte
    - `getCurrentValuesFromForm` - Aktuelle Werte aus Form
    - `getCurrentValuesFromDirect` - Aktuelle Werte aus Direct State
    - `createFormUpdateHandler` - Form Update Handler
  - 39 neue Tests hinzugefügt
  - Alle Tests bestehen (1455 Tests)
  - Keine any types eingeführt
  - Aufwand: 0,3 Tage

- [x] **generateCalculationExplanations** (src/utils/data-export.ts) ✅ ERLEDIGT
  - Original: `any` types (16 insgesamt in Datei)
  - Aktuell: 0 `any` types in data-export.ts
  - Status: ✅ Alle `any` types durch spezifische Types ersetzt
  - Extrahierte Hilfsfunktionen: 3
    - `addSegmentedWithdrawalDetails` - Segmentierte Entnahme-Details
    - `addSingleStrategyDetails` - Einzelstrategie-Details mit Params-Objekt
    - `addWithdrawalStrategySection` - Entnahmestrategie-Koordination
  - Neue Types erstellt: 2
    - `SavingsData` - Sparplan-Daten Interface
    - `AddSingleStrategyDetailsParams` - Parameter für Strategie-Details
    - `AddWithdrawalStrategyParams` - Parameter für Strategie-Sektion
  - Alle `any` und `unknown` types durch `WithdrawalSegment` und `SparplanElement` ersetzt
  - 8 neue Tests hinzugefügt für alle Entnahmestrategien
  - Alle 1455 Tests bestehen
  - Warnings reduziert von 158 → 156 (2 weniger)
  - Aufwand: 0,2 Tage

- [ ] **SparplanEingabe** (src/components/SparplanEingabe.tsx) 🔄 IN PROGRESS
  - Original: Komplexität: 30, Zeilen: 759
  - Aktuell: Komplexität: 30, Zeilen: 626
  - Status: ⏳ Zeilen um 18% reduziert, Komplexität unverändert
  - Extrahierte Hilfsfunktionen: 8
    - `createNewSparplan` - Neuen Sparplan erstellen (komplexität <8, 23 zeilen)
    - `createNewSinglePayment` - Einmalzahlung erstellen (komplexität <8, 14 zeilen)
    - `isEinmalzahlung` - Prüfung auf Einmalzahlung (komplexität <8, 3 zeilen)
    - `updateExistingSparplan` - Sparplan aktualisieren (komplexität <8, 47 zeilen)
    - `getInitialSingleFormValue` - Initiale Formwerte (komplexität <8, 8 zeilen)
    - `getInitialSparplanFormValue` - Initiale Formwerte (komplexität <8, 9 zeilen)
    - `populateSingleFormFromSparplan` - Form befüllen (komplexität <8, 8 zeilen)
    - `populateSparplanFormFromSparplan` - Form befüllen (komplexität <8, 13 zeilen)
  - Alle Hilfsfunktionen mit Params-Objekten für >5 Parameter
  - 16 neue Tests hinzugefügt für alle Hilfsfunktionen
  - Alle 1470+ Tests bestehen
  - Aufwand: 0,3 Tage (Teilweise erledigt)

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

- [x] **formatParametersForExport** (src/utils/parameter-export.ts) ✅ ERLEDIGT
  - Original: Komplexität: 26, Zeilen: 154
  - Aktuell: Komplexität: <8, Zeilen: 103
  - Status: ✅ Beide Limits erreicht (Komplexität <8, Zeilen <400)
  - Extrahierte Hilfsfunktionen: 18
    - `formatBasicParameters` - Basis-Finanzparameter
    - `formatInflationAndReturns` - Inflation und Rendite-Einstellungen
    - `formatVariableReturns` - Variable Renditen pro Jahr
    - `formatTaxAllowances` - Freibeträge pro Jahr
    - `formatSparplanItem` - Einzelner Sparplan/Sonderereignis
    - `formatSparplanBasicInfo` - Basis-Sparplan-Informationen
    - `formatSparplanSpecialEventData` - Sonderereignis-Daten
    - `formatSparplanCostFactors` - Kostenkomponenten
    - `formatWithdrawalConfiguration` - Entnahme-Konfiguration
    - `formatWithdrawalConfigDetails` - Detaillierte Entnahme-Konfiguration
    - `formatDefaultWithdrawalConfig` - Standard Entnahme-Konfiguration
    - `formatWithdrawalInflation` - Entnahme-Inflation
    - `formatWithdrawalStrategyDetails` - Strategie-spezifische Details
    - `formatGrundfreibetragConfig` - Grundfreibetrag-Konfiguration
    - `formatWithdrawalReturnMode` - Entnahme-Rendite-Modus
    - `formatSegmentedWithdrawal` - Segmentierte Entnahme
    - `formatComparisonMode` - Vergleichsmodus
    - `formatWithdrawalSegment` - Einzelnes Entnahme-Segment
  - Zusätzliche Segment-Hilfsfunktionen: 5
    - `formatSegmentReturnConfig` - Segment-Rendite-Konfiguration
    - `formatSegmentStrategyParams` - Segment-Strategie-Parameter
    - `formatDynamicStrategyConfig` - Dynamische Strategie-Konfiguration
    - `formatBucketStrategyConfig` - Bucket-Strategie-Konfiguration
    - `formatBucketDynamicSubStrategy` - Bucket-Dynamische-Sub-Strategie
    - `formatSegmentTaxAndInflation` - Segment-Steuer und Inflation
  - Alle Hilfsfunktionen mit Params-Objekten für >5 Parameter
  - Keine any types eingeführt - alle mit spezifischen Interfaces
  - Alle Tests bestehen (1455 Tests)
  - Aufwand: 0,3 Tage

- [ ] **exportDataToMarkdown** (src/utils/data-export.ts) - ✅ BEREITS ERLEDIGT (Komplexität bereits unter Limit)
- [x] **createTaxableIncomeExplanation** (src/components/calculationHelpers.ts) ✅ ERLEDIGT
  - Original: Komplexität: 33, Zeilen: 150
  - Aktuell: Komplexität <8, Zeilen: 48
  - Status: ✅ Beide Limits erreicht (Komplexität <8, Zeilen <50)
  - Extrahierte Hilfsfunktionen: 6
    - `calculateTotalTaxableIncome` - Berechnung Gesamteinkommen
    - `addStatutoryPensionStep` - Gesetzliche Rente Step hinzufügen
    - `addOtherIncomeStep` - Andere Einkünfte Step hinzufügen
    - `addHealthCareInsuranceStep` - Krankenversicherung Step hinzufügen
    - `buildTotalIncomeCalculationText` - Berechnungstext erstellen
    - `addTotalIncomeStepIfNeeded` - Gesamteinkommen Step hinzufügen
    - `buildTaxableIncomeFinalValues` - Finale Werte erstellen
  - Alle Hilfsfunktionen mit Params-Objekten für >5 Parameter
  - Neue Types: TaxableIncomeParams
  - 8 neue Tests hinzugefügt für alle Helper-Funktionen
  - Alle 1470 Tests bestehen
  - Aufwand: 0,2 Tage
- [x] **calculateCoupleHealthInsuranceForYear** (helpers/health-care-insurance.ts) ✅ ERLEDIGT
  - Original: Komplexität: 30
  - Aktuell: Komplexität: <8
  - Status: ✅ Komplexität unter Limit (Komplexität <8)
  - Extrahierte Hilfsfunktionen: 6
    - `createPersonResult` - Person Result Objekt erstellen
    - `createZeroInsuranceResult` - Null-Versicherung für Familienversicherte
    - `calculateFamilyScenarios` - Familien-Versicherungs-Szenarien
    - `getBestFamilyOption` - Beste Familien-Option ermitteln
    - `applyIndividualStrategy` - Individuelle Strategie anwenden mit Params-Objekt
    - `applyFamilyStrategy` - Familien-Strategie anwenden mit Params-Objekt
  - Alle Hilfsfunktionen mit Params-Objekten für >5 Parameter
  - Keine any types eingeführt - alle mit spezifischen Types
  - Alle 1462 Tests bestehen
  - Aufwand: 0,3 Tage
- [x] **CareCostConfiguration** (src/components/CareCostConfiguration.tsx) ✅ ERLEDIGT
  - Original: Komplexität: 27, Zeilen: 478
  - Aktuell: Komplexität <25, Zeilen: 285
  - Status: ✅ Beide Limits erreicht (Komplexität <25, Zeilen <400)
  - Extrahierte Komponenten: 4
    - `CareLevelSelector` - Pflegegrad-Auswahl (56 Zeilen)
    - `CoupleCareCostConfig` - Paar-Konfiguration (142 Zeilen)
    - `CareCostPreview` - Kostenvorschau (111 Zeilen)
    - `CareCostValidationErrors` - Validierungsfehler (35 Zeilen)
  - Alle Komponenten mit spezifischen Props-Interfaces
  - Alle 1470 Tests bestehen
  - Keine any types eingeführt
  - Aufwand: 0,3 Tage
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

#### 3.1 `max-depth` Warnung ✅ ERLEDIGT

- [x] **convertSparplanToElements** (src/utils/sparplan-utils.ts) ✅ ERLEDIGT
  - Original: max-depth: 6 (Zeile 154)
  - Aktuell: max-depth: 3
  - Status: ✅ max-depth warning eliminiert
  - Extrahierte Hilfsfunktionen: 6
    - `createSparplanElement` - Sparplan-Element erstellen mit Params-Objekt
    - `shouldIncludeMonth` - Monat-Inklusion prüfen
    - `processMonthlyElements` - Monatliche Elemente verarbeiten
    - `calculateYearlyAmount` - Jährlichen Betrag berechnen
    - `processYearlyElement` - Jährliches Element verarbeiten
    - `processRegularSavingsPlan` - Regulären Sparplan verarbeiten
    - `processOneTimePayment` - Einmalzahlung verarbeiten
  - Alle Hilfsfunktionen mit complexity < 8 und lines < 50
  - Parameter-Objekt CreateElementParams verwendet
  - Alle 1462 Tests bestehen
  - Aufwand: 0,2 Tage

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
4. **Parameter-Anzahl:** Max. 5 Parameter, sonst Objekt verwenden mit types
5. **Testbarkeit:** Extrahierte Funktionen sollten testbar sein
6. Keine any-types einführen
7. complexity max 8
8. max-lines-per-function max 50

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
3. ✅ **ERLEDIGT:** GlobalPlanningConfiguration refactoring
   - Komplexität von 54 → <25 reduziert
   - Zeilen von 514 → 185 reduziert (64% Verbesserung)
   - 6 neue fokussierte Komponenten extrahiert
   - Alle 1397 Tests bestehen
4. ✅ **ERLEDIGT:** useWithdrawalModals refactoring
   - Komplexität von 48 → <8 reduziert (83% Verbesserung)
   - Zeilen von 202 → 119 reduziert (41% Verbesserung)
   - 10 neue Hilfsfunktionen extrahiert
   - 24 neue Tests hinzugefügt
   - Alle `any` Types ersetzt durch spezifische Types
   - Alle Tests bestehen
5. ✅ **ERLEDIGT:** generateCalculationExplanations refactoring (src/utils/data-export.ts)
   - Alle 16 `any` types in data-export.ts behoben
   - 3 neue Hilfsfunktionen extrahiert (max complexity 8, max 50 lines)
   - 8 neue Tests hinzugefügt
   - Alle Tests bestehen
6. ✅ **ERLEDIGT:** convertSparplanToElements refactoring (src/utils/sparplan-utils.ts)
   - max-depth von 6 → 3 reduziert (max-depth warning eliminated)
   - 6 neue Hilfsfunktionen extrahiert (complexity < 8, lines < 50)
   - Parameter-Objekt CreateElementParams verwendet
   - Alle 1462 Tests bestehen
7. ✅ **ERLEDIGT:** calculateCoupleHealthInsuranceForYear refactoring (helpers/health-care-insurance.ts)
   - Komplexität von 30 → <8 reduziert (73% Verbesserung)
   - 6 neue Hilfsfunktionen extrahiert mit Parameter-Objekten
   - Parameter-Objekte: CreatePersonResultParams, ApplyStrategyParams
   - Keine any types eingeführt
   - Alle 1462 Tests bestehen
8. Top 5 `any` Type Dateien angehen

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
- **Aktueller Stand:** 147 Warnungen (reduziert von 150 → 2% Reduktion in diesem PR, 16% gesamt von ursprünglich 176)
- **Fortschritt:** 35% (calculateWithdrawal, GlobalPlanningConfiguration, useWithdrawalModals, generateCalculationExplanations, WithdrawalSegmentForm Arrow + WithdrawalSegmentCard, convertSparplanToElements, calculateCoupleHealthInsuranceForYear vollständig refactored ✅)
- **Geschätzte Fertigstellung:** 2025-01-25 (bei Vollzeit-Arbeit)

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

**Letzte Aktualisierung:** 2025-01-11  
**Nächste Review:** Nach Abschluss Phase 1.2
