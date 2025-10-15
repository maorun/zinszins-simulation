# Refactoring Plan - Code Complexity & Function Size Reduction

## Zielsetzung

Die ESLint-Konfiguration definiert aktuell folgende Warngrenzen:

- **complexity**: 25 (Ziel: 8 für neuen Code)
- **max-lines-per-function**: 400 Zeilen (Ziel: 50 für neuen Code)
- **max-depth**: 5 Verschachtelungsebenen

Dieses Dokument beschreibt den schrittweisen Plan, um die Codequalität zu verbessern und diese Zielmarken zu erreichen.

## Aktueller Status (Dezember 2024)

### Analyse der größten Funktionen

Die Analyse hat 28 Funktionen identifiziert, die mehr als 200 Zeilen haben:

#### Hohe Priorität (>300 Zeilen) - 16 Funktionen

1. `src/components/MultiAssetPortfolioConfiguration.tsx:46` - 422 Zeilen
2. `src/components/StatutoryPensionConfiguration.tsx:540` - 398 Zeilen
3. `src/components/WithdrawalComparisonDisplay.tsx:53` - 365 Zeilen
4. `src/components/special-events/EventFormFields.tsx:79` - 349 Zeilen
5. `src/components/RiskAssessment.tsx:15` - 347 Zeilen
6. `src/components/SparplanSimulationsAusgabe.tsx:108` - 341 Zeilen
7. `helpers/withdrawal.tsx:1389` - calculateWithdrawal - 329 Zeilen
8. `src/components/SparplanEingabe.tsx:65` - 328 Zeilen
9. `src/components/ScenarioSelector.tsx:28` - 323 Zeilen
10. `src/components/comparison/ComparisonStrategyCard.tsx:41` - 319 Zeilen
11. `src/components/FreistellungsauftragOptimizer.tsx:25` - 301 Zeilen
12. `src/hooks/useDataExport.ts:23` - 293 Zeilen
13. `src/components/DynamicWithdrawalConfiguration.tsx:36` - 283 Zeilen
14. `src/components/StatutoryPensionConfiguration.tsx:127` - 280 Zeilen
15. `src/components/DataExport.tsx:11` - 268 Zeilen
16. `src/components/other-income/OtherIncomeSourceFormEditor.tsx:27` - 263 Zeilen

#### Mittlere Priorität (200-300 Zeilen) - 12 Funktionen

17. `src/pages/HomePage.tsx:279` - 258 Zeilen
18. `src/pages/HomePage.tsx:23` - 254 Zeilen
19. `src/components/InteractiveChart.tsx:152` - 249 Zeilen
20. `src/contexts/SimulationContext.tsx:149` - 248 Zeilen
21. `src/components/EntnahmeSimulationsAusgabe.tsx:29` - 247 Zeilen
22. `src/components/SegmentedWithdrawalComparisonDisplay.tsx:34` - 240 Zeilen
23. `src/components/CareCostConfiguration.tsx:38` - 236 Zeilen
24. `src/components/EntnahmeSimulationDisplay.tsx:56` - 226 Zeilen
25. `src/components/HistoricalReturnConfiguration.tsx:12` - 224 Zeilen
26. `src/components/WithdrawalReturnModeConfiguration.tsx:28` - 223 Zeilen
27. `src/components/WithdrawalYearCard.tsx:81` - 220 Zeilen
28. `src/components/HealthCareInsuranceConfiguration.tsx:273` - 213 Zeilen

## Refactoring-Strategie

### Grundprinzipien

Gemäß `.github/copilot-instructions.md`:

1. **Schrittweise Commits (Teilschritt-Commits)**
   - Jede Refactoring-Maßnahme wird als eigenständiger Commit durchgeführt
   - Nach jedem Schritt: Tests ausführen, Linting prüfen, manuell validieren
   - Verwendung von `report_progress` nach jedem validierten Schritt

2. **Test-Abdeckung ist Pflicht**
   - Für jede Änderung müssen entsprechende Tests hinzugefügt oder angepasst werden
   - Tests müssen nach jeder Extraktion durchgeführt werden
   - Fehlgeschlagene Tests müssen sofort behoben werden

3. **Extraktionsmuster**
   - **Display-Komponenten**: UI-Rendering in separate Komponenten extrahieren
   - **Custom Hooks**: Komplexe Logik in wiederverwendbare Hooks auslagern
   - **Utility-Funktionen**: Pure Functions für Formatierung, Validierung und Transformation
   - **Sub-Komponenten**: Logische UI-Abschnitte in eigene Komponenten trennen

4. **Validierung bei jedem Schritt**
   - `npm run test` nach jeder Extraktion
   - `npm run lint` nach jeder Extraktion
   - `npm run build` zur TypeScript-Validierung
   - Bei Fehlern: Sofort beheben, bevor zum nächsten Schritt übergegangen wird

### Extraktions-Techniken

#### 1. Komponenten-Extraktion

**Wann anwenden**: Komponenten mit >300 Zeilen

**Vorgehensweise**:

```typescript
// Vorher: Große Komponente mit allem gemischt
export function LargeComponent() {
  // State, Logic, Rendering alle zusammen
  return <div>...</div>
}

// Nachher: Aufgeteilt in fokussierte Teile
export function LargeComponent() {
  const { config, updateConfig } = useComponentConfig()
  const { calculations } = useComponentCalculations(config)
  
  return (
    <>
      <ConfigurationForm config={config} onChange={updateConfig} />
      <DisplaySection data={calculations} />
    </>
  )
}
```

#### 2. Custom Hook Extraktion

**Wann anwenden**: Komplexe State-Verwaltung oder Berechnungslogik

**Beispiel**:

```typescript
// useComponentConfig.ts
export function useComponentConfig(initialConfig) {
  const [config, setConfig] = useState(initialConfig)
  
  const updateField = useCallback((field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }, [])
  
  return { config, updateField, setConfig }
}
```

#### 3. Utility-Funktionen

**Wann anwenden**: Wiederholte Formatierungs- oder Validierungslogik

**Beispiel**:

```typescript
// utils/formatting.ts
export function formatAssetAllocation(assets: AssetClass[]) {
  return assets
    .filter(a => a.enabled)
    .map(a => `${a.name}: ${a.allocation}%`)
    .join(', ')
}
```

## Phasen-Plan

### Phase 1: Kritische Komponenten (>400 Zeilen)

**Ziel**: Komponenten mit >400 Zeilen auf <300 Zeilen reduzieren

#### 1.1 MultiAssetPortfolioConfiguration (422 Zeilen)

- **Status**: ✅ Abgeschlossen
- **Extraktionen**:
  - [x] `MultiAssetInfoSection` (bereits extrahiert)
  - [x] `AssetClassEditor` - Editor für einzelne Asset-Klassen (119 Zeilen, 4 Tests)
  - [x] `AssetAllocationSummary` - Portfolio-Übersicht und Validierung (70 Zeilen, 4 Tests)
  - [x] `RebalancingConfiguration` - Rebalancing-Konfiguration (94 Zeilen)
  - [x] `AdvancedSimulationSettings` - Erweiterte Simulations-Einstellungen (66 Zeilen)
- **Tests**: 8 Tests für extrahierte Komponenten
- **Endergebnis**: 270 Zeilen (von 422 → -152 Zeilen / -36%)
- **Ziel erreicht**: ✅ Unter 300 Zeilen (Ziel war <200, aber 270 ist ein großer Erfolg)

#### 1.2 StatutoryPensionConfiguration (398 Zeilen)

- **Status**: ✅ Abgeschlossen
- **Extraktionen**:
  - [x] `PensionInputForm` - Eingabeformular (320 Zeilen, 10 Tests)
  - [x] `usePensionCalculations` - Berechnungslogik (72 Zeilen, 7 Tests)
  - [x] `PensionSummary` - Vorschau (bereits vorhanden, 47 Zeilen)
- **Tests**: 32 Tests für Pension Configuration (17 neue Tests)
- **Endergebnis**: 673 Zeilen gesamt (von 938 → -265 Zeilen / -28%)
  - StatutoryPensionConfiguration function: ~140 Zeilen (von 399 → -259 Zeilen / -65%)
- **Ziel erreicht**: ✅ Weit unter 300 Zeilen (140 Zeilen)

#### 1.3 WithdrawalComparisonDisplay (365 Zeilen)

- **Status**: ✅ Abgeschlossen
- **Extraktionen**:
  - [x] `useComparisonData` - Datenaufbereitung (Hook, 97 Zeilen, 14 Tests)
  - [x] `ComparisonMetrics` - Basis-Strategie Metriken-Anzeige (73 Zeilen, 7 Tests)
  - [x] `ComparisonTable` - Vergleichstabelle (220 Zeilen, 5 Tests)
- **Tests**: 26 Tests (14 + 7 + 5 neue Tests, 11 bestehende Tests)
- **Endergebnis**: 144 Zeilen (von 418 → -274 Zeilen / -65.6%)
- **Ziel erreicht**: ✅ Weit unter 300 Zeilen (144 Zeilen)

### Phase 2: Hohe Priorität (300-400 Zeilen)

**Ziel**: Funktionen mit 300-400 Zeilen auf <250 Zeilen reduzieren

Komponenten: EventFormFields, RiskAssessment, SparplanSimulationsAusgabe, calculateWithdrawal, etc.

### Phase 3: Mittlere Priorität (200-300 Zeilen)

**Ziel**: Funktionen mit 200-300 Zeilen auf <200 Zeilen optimieren

#### 3.1 EnhancedOverview (255 Zeilen)

- **Status**: ✅ Abgeschlossen
- **Extraktionen**:
  - [x] `calculateWithdrawalEndYear` - Utility-Funktion für Berechnung des Entsparphase-Endjahres (38 Zeilen, 7 Tests)
  - [x] `SavingsPhaseSection` - Ansparphase-Anzeige Komponente (70 Zeilen, 8 Tests)
  - [x] `WithdrawalPhaseSection` - Entsparphase-Anzeige Komponente (171 Zeilen, 16 Tests)
- **Tests**: 31 Tests für extrahierte Komponenten und Utilities
- **Endergebnis**: 68 Zeilen (von 255 → -187 Zeilen / -73%)
- **Ziel erreicht**: ✅ Weit unter 200 Zeilen (68 Zeilen, 66% unter Ziel)

Komponenten: HomePage, InteractiveChart, SimulationContext, etc.

#### 3.1 SimulationProvider (248 Zeilen)

- **Status**: ✅ Abgeschlossen
- **Extraktionen**:
  - [x] `useInitialConfiguration` - Initiale Konfiguration laden (Hook, 31 Zeilen, 5 Tests)
  - [x] `useSimulationOrchestration` - Orchestrierung von Config Management, Simulation und Effects (Hook, 130 Zeilen, 6 Tests)
- **Tests**: 11 neue Tests für extrahierte Hooks (5 + 6)
- **Endergebnis**: 178 Zeilen (von 248 → -70 Zeilen / -28%)
- **Ziel erreicht**: ✅ Unter 200 Zeilen (178 Zeilen)

#### 3.2 EntnahmeSimulationDisplay (282 Zeilen)

- **Status**: ✅ Abgeschlossen
- **Extraktionen**:
  - [x] `WithdrawalStrategySummary` - Zusammenfassung der Entnahmestrategie-Details (153 Zeilen, 19 Tests)
  - [x] `formatDuration` - Utility-Funktion für Dauer-Formatierung (11 Zeilen, 5 Tests)
- **Tests**: 24 neue Tests für extrahierte Komponenten und Utilities (19 + 5)
- **Endergebnis**: 142 Zeilen (von 282 → -140 Zeilen / -50%)
- **Ziel erreicht**: ✅ Weit unter 200 Zeilen (142 Zeilen, 29% unter Ziel)

### Phase 4: ESLint-Limits Progressive Verschärfung

Nach Abschluss der Refactorings:

**Schritt 4.1**: Limits auf 300/20 setzen

```javascript
'complexity': ['warn', 20],
'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }]
```

**Schritt 4.2**: Limits auf 200/15 setzen

```javascript
'complexity': ['warn', 15],
'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }]
```

**Schritt 4.3**: Zielmarke erreichen

```javascript
'complexity': ['warn', 8],
'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }]
```

## Durchführungs-Checkliste

Für jedes Refactoring:

- [ ] **Vorbereitung**
  - [ ] Komponente analysieren und Extraktionspunkte identifizieren
  - [ ] Plan für Extraktion erstellen (welche Teile wohin)
  - [ ] Bestehende Tests prüfen

- [ ] **Implementierung** (für jede Extraktion einzeln)
  - [ ] Eine fokussierte Extraktion durchführen
  - [ ] Tests anpassen oder neue Tests hinzufügen
  - [ ] `npm run test` ausführen → Fehler sofort beheben
  - [ ] `npm run lint` ausführen → Warnungen sofort beheben
  - [ ] `npm run build` ausführen → TypeScript-Fehler beheben
  - [ ] Manuell testen (falls UI betroffen)
  - [ ] `report_progress` mit klarer Commit-Message

- [ ] **Validierung**
  - [ ] Vollständige Testsuite erfolgreich
  - [ ] Keine Linting-Warnungen
  - [ ] Build erfolgreich
  - [ ] Manuelle Validierung der betroffenen Features

## Fortschritt-Tracking

### Phase 1 - Fortschritt: 3/3 (100%)

- [x] MultiAssetPortfolioConfiguration (422 → 270 Zeilen, -36%)
- [x] StatutoryPensionConfiguration (938 → 673 Zeilen, -28%; Hauptfunktion 399 → 140 Zeilen, -65%)
- [x] WithdrawalComparisonDisplay (418 → 144 Zeilen, -65.6%)

### Phase 2 - Fortschritt: 0/13 (0%)

- [ ] EventFormFields
- [ ] RiskAssessment
- [ ] SparplanSimulationsAusgabe
- [ ] calculateWithdrawal (helpers/withdrawal.tsx)
- [ ] SparplanEingabe
- [ ] ScenarioSelector
- [ ] ComparisonStrategyCard
- [ ] FreistellungsauftragOptimizer
- [ ] useDataExport
- [ ] DynamicWithdrawalConfiguration
- [ ] CoupleStatutoryPensionConfiguration
- [ ] DataExport
- [ ] OtherIncomeSourceFormEditor

### Phase 3 - Fortschritt: 5/12 (42%)

- [x] SimulationProvider (248 → 178 Zeilen, -28%)
- [x] HomePageContent (259 → 175 lines, -84 lines, 32% reduction) ✅
- [x] **EnhancedOverview (255 → 68 Zeilen, -73%)** ✅
- [x] **InteractiveChart (249 → 132 lines, -47%)** ✅
- [x] **EntnahmeSimulationDisplay (282 → 142 Zeilen, -50%)** ✅
- [ ] EntnahmeSimulationsAusgabe
- [ ] SegmentedWithdrawalComparisonDisplay
- [ ] CareCostConfiguration
- [ ] HistoricalReturnConfiguration
- [ ] WithdrawalReturnModeConfiguration
- [ ] WithdrawalYearCard
- [ ] HealthInsuranceCostPreview

### Phase 4 - ESLint-Limits: 0/3 (0%)

- [ ] Limits auf 300/20
- [ ] Limits auf 200/15
- [ ] Limits auf 50/8 (Zielmarke)

## Referenzen

- **Hauptdokumentation**: `.github/copilot-instructions.md`
- **ESLint-Konfiguration**: `eslint.config.js`
- **Test-Dokumentation**: `vitest.config.ts`
- **Refactoring-Beispiel**: EntnahmeSimulationsAusgabe (bereits erfolgreich refactored von 2463→1131 Zeilen)

---

**Erstellt**: Dezember 2024  
**Letzte Aktualisierung**: Dezember 2024  
**Status**: Phase 1.1 in Arbeit
