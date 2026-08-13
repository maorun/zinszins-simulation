# Zinseszins-Rechner

Deutscher Zinseszins-Rechner für Sparpläne und Kapitalanlagen mit umfassender Steuerberechnung und Entnahmeplanung.

**Live-Version:** https://zinszins-simulation.vercel.app/

---

## Inhaltsverzeichnis

- [Feature-Übersicht](#feature-übersicht)
- [Detaillierte Feature-Beschreibungen](#detaillierte-feature-beschreibungen)
- [Entwicklung](#entwicklung)

---

## Feature-Übersicht

Der Zinseszins-Rechner bietet umfassende Funktionen für die langfristige Finanzplanung mit Fokus auf deutsches Steuerrecht:

### 🧭 Schritt-für-Schritt-Navigation (Wizard)

Neue Nutzer starten mit einer geführten Schritt-für-Schritt-Navigation, die die wichtigsten Einstellungen übersichtlich abfragt:

1. **Zeitspanne** – Sparphase und Entnahmephase festlegen
2. **Sparplan** – Monatliche Sparrate und Renditeerwartung eingeben
3. **Entnahme-Strategie** – Entnahmestrategie für die Rentenphase wählen
4. **Ergebnis** – Wichtigste Kennzahlen auf einen Blick

Über den Button **„Erweiterte Ansicht"** lassen sich alle Detaileinstellungen (Steuern, Monte-Carlo, Szenarien, Export u.v.m.) aufrufen. Mit **„Zur einfachen Ansicht"** kehrt man jederzeit zum Wizard zurück.

### 🎯 Kern-Features

#### Zeitspanne und Berechnungsmodus

- Flexibler Zeitraum-Selektor für individuelle Planungshorizonte
- Monatliche und jährliche Berechnungsmodi

#### Rendite-Konfigurationen

- **Feste Rendite** - Konstante jährliche Rendite
- **Zufällige Rendite** - Monte Carlo Simulation mit konfigurierbarer Volatilität
- **Variable Rendite** - Jahr-für-Jahr individuell konfigurierbare Renditen
- **Historische Daten** - Backtesting mit realen Marktdaten (DAX, S&P 500, MSCI World)
- **Multi-Asset Portfolio** - Diversifiziertes Portfolio mit 7 Anlageklassen und automatischem Rebalancing
- **Währungsrisiko-Management** - Absicherungsstrategien für internationale Investments
- **Geografische Diversifikation** - Regionale Aufteilung mit automatischer Quellensteuerberechnung
- **ESG-Integration** - Nachhaltigkeitsfilter für ethisch ausgerichtete Portfolios
- **Benchmark-Integration** - Vergleich gegen bekannte Marktindizes
- **Portfolio-Performance Dashboard** - Umfassende KPI-Analyse (Sharpe Ratio, Sortino Ratio, Maximum Drawdown, etc.)

#### Sparplan und Einmalzahlungen

- **Dynamische Sparraten** - Automatische Anpassung an Lebensabschnitte
- **Mehrere Sparpläne** - Unbegrenzte Anzahl paralleler Sparpläne
- **Einmalzahlungen** - Flexible Zusatzeinzahlungen zu beliebigen Zeitpunkten
- **Sonderereignisse** - Erbschaften, Bonuszahlungen, Schenkungen, Steuerrückzahlungen

#### Finanzielle Meilensteine

Planbare Lebensereignisse mit automatischer Kapitalberechnung:

- Immobilienkauf, Renovierungen, Fahrzeugkauf
- Ausbildungskosten (Studium, Auslandssemester, Weiterbildung)
- Familienereignisse (Hochzeit, Kinder, Elternzeit)
- Geschäftsgründungen und Sabbaticals

#### Kostenfaktoren

- **Depotgebühren** - Prozentuale und feste jährliche Kosten
- **Verwaltungskosten** - ETF/Fonds-TER (Total Expense Ratio)
- **Ausgabeaufschläge** - Einmalige Kosten beim Kauf

#### Steuerberechnung (Deutsches Steuerrecht)

Vollständige Integration deutscher Steuervorschriften:

- **Vorabpauschale** - Automatische Berechnung nach aktueller Gesetzgebung
- **Freibetrag** - Konfigurierbarer Sparerpauschbetrag (Standard: 2.000 €)
- **Kapitalertragsteuer** - Inklusive Solidaritätszuschlag (Standard: 26,375%)
- **Teilfreistellung** - Für Aktien- und Immobilienfonds
- **Verlusttopf** - Verlustverrechnung und Tax Loss Harvesting
- **Kirchensteuer** - Optional mit Bundesland-spezifischen Sätzen
- **Progressionsvorbehalt** - Für Rentner mit ausländischen Einkünften
- **Grenzfälle** - Sozialversicherungsoptimierung
- **Einzel- vs. Gemeinschaftsdepot** - Steuervergleich für Ehepaare zwischen getrennten Depots (2 × 2.000€) und Gemeinschaftsdepot (1 × 4.000€)
- **Steuerbescheinigung-Simulator** - Vorschau der jährlichen Steuerbescheinigung für Kapitalerträge mit detaillierter Aufschlüsselung von Erträgen, Freibeträgen, Vorabpauschale und gezahlten Steuern. Export-Funktion für Steuererklärung (Anlage KAP)

### 📊 Planung & Analyse

#### Szenario-Verwaltung

- **Szenario-Bibliothek** - Vordefinierte und eigene Szenarien
- **Was-wäre-wenn Analysen** - Vergleich verschiedener Szenarien
- **Export/Import** - Speicherung und Austausch von Szenarien

#### Interaktive Tutorials

- Schritt-für-Schritt Anleitungen
- Tooltips und Hilfe-Texte
- Glossar mit Fachbegriffen

#### Finanzbildung

- **Finanzbildungs-Quiz** - Interaktives Lernen
- **Behavioral Finance Insights** - Verhaltensökonomische Hinweise
- **Marktpsychologie-Indikatoren** - Fear & Greed Index, VIX, etc.

#### Ziele & Fortschrittsverfolgung

- Definierbare finanzielle Ziele
- Automatische Fortschrittsberechnung
- Visuelle Darstellung des Zielerreichungsgrades

### 💰 Spezielle Planungsszenarien

#### Liquiditätsreserve / Notfallfonds

- Bedarfsermittlung basierend auf monatlichen Ausgaben
- Aufbaustrategien
- Integration in Gesamtplanung

#### Unterhaltszahlungen

- Kindesunterhalt nach Düsseldorfer Tabelle
- Trennungsunterhalt und nachehelicher Unterhalt
- Automatische Anpassungen

#### Eigenheim vs. Miete

- Vollständiger Kostenvergleich
- Opportunitätskosten-Analyse
- Langfristige Vermögensentwicklung

#### Immobilien-Leverage

- Eigenkapital vs. Fremdkapital-Analyse
- Zinseffekte und Steuervorteile
- Risikobetrachtung

#### Globale Planung

- Einzelperson vs. Ehepaar
- Gemeinsame und getrennte Depots
- Steueroptimierung für Paare

### 🎨 Visualisierung & Bedienung

#### Interaktive Visualisierung

- **Charts** - Kapitalentwicklung, Renditeverteilungen, Monte Carlo Simulationen
- **Heatmaps** - Korrelationsmatrizen, Sensitivitätsanalysen
- **3D-Visualisierung** - Dreidimensionale Darstellung von Zeit-Rendite-Kapital-Zusammenhängen mit interaktiven Steuerelementen
- **Datentabellen** - Detaillierte Jahr-für-Jahr Aufschlüsselungen

#### Tastaturkürzel

- Schnellzugriff auf häufig genutzte Funktionen
- Effiziente Navigation

#### Dashboard-Anpassung

- Personalisierbare Layouts
- Auswahl relevanter Widgets
- Anpassbare Ansichten

#### Finanz-KPIs & Widgets

- Key Performance Indicators
- Echtzeit-Berechnungen
- Übersichtliche Darstellung

### 🎯 Auszahlungsphase (Entnahmeplanung)

Umfassende Planung der Entnahmephase mit deutschen Steuerbesonderheiten:

#### Entnahmestrategien

- **Feste monatliche Beträge** - Mit Inflationsausgleich und Guardrails
- **Prozentuale Entnahmen** - 4%-Regel, 3%-Regel, variable Prozentsätze
- **Dynamische Strategien** - Variable Entnahmen basierend auf Lebenserwartung, Portfolio-Performance oder CAPE-Ratio
- **Guyton-Klinger-Regel** - Anpassungsregeln für nachhaltige Entnahmen
- **Segment-Strategien** - Bucket-Strategie mit zeitbasierten Segmenten
- **Inflation-Adjusted Floor-Ceiling** - Dynamische Anpassung zwischen Unter- und Obergrenze

#### Staatliche Renten

- **Gesetzliche Rente** - Integration der Deutschen Rentenversicherung
- **Betriebsrente** - Direktzusagen, Pensionskassen, Direktversicherungen
- **Riester-Rente** - Mit Zulagen und steuerlicher Förderung
- **Rürup/Basisrente** - Steueroptimiert für Selbstständige

#### Gesundheit & Pflege

- **Krankenversicherung** - GKV und PKV im Ruhestand
- **Pflegeversicherung** - Pflichtbeiträge und Zusatzversicherungen
- **Pflegephasen-Planung** - Erhöhter Kapitalbedarf bei Pflegebedürftigkeit

#### Versicherungen im Ruhestand

- **Lebensversicherungen** - Risikolebensversicherung, Berufsunfähigkeitsversicherung
- **Haftpflicht & Sachversicherungen** - Fortführung relevanter Absicherungen

#### Rentenpunkte-Integration

- **Einzahlungsbasierte Berechnung** - Realistische Rentenprognose
- **Renteneintrittszeitpunkt** - Flexible Altersplanung mit Abschlägen/Zuschlägen
- **Inflation & Rentenanpassung** - Langfristige Kaufkraftbetrachtung

#### Steueroptimierung in der Entnahmephase

- **Alterseinkünftegesetz** - Korrekte Besteuerung von Renten
- **Günstigerprüfung** - Automatischer Vergleich Abgeltungsteuer vs. persönlicher Steuersatz
- **Werbungskosten** - Berücksichtigung für Kapitalerträge
- **Grundfreibetrag** - Steuerfreies Existenzminimum

#### Geteilte Entsparphasen

- **Mehrere Phasen** - Unterschiedliche Strategien für verschiedene Lebensabschnitte
- **Übergangsplanung** - Nahtloser Wechsel zwischen Phasen
- **Vergleichsanalysen** - Gegenüberstellung verschiedener Ansätze

### 📈 Analyse und Simulation

#### Monte Carlo Analyse

- Tausende Simulationsläufe
- Erfolgswahrscheinlichkeiten
- Perzentildarstellungen (10%, 50%, 90%)
- Szenarioanalyse (best/worst/median case)

#### Sensitivitätsanalyse

- Auswirkungen von Parameteränderungen
- Robustheit der Planung
- Identifikation kritischer Faktoren

#### Datenexport

- **Parameter-Export** - JSON-Format für Szenarien
- **CSV-Export** - Jahreswerte für Excel-Analysen
- **Markdown-Export** - Dokumentation für Reports

#### Progressive Web App & Offline-Nutzung

- **Installierbare App** - Unterstützt die Installation auf Desktop und Mobilgeräten
- **Offline-fähig** - Bereits geladene Anwendung und statische Assets funktionieren auch ohne Internetverbindung
- **Automatische Updates** - Service Worker aktualisiert die Anwendung im Hintergrund

---

## Detaillierte Feature-Beschreibungen

Ausführliche technische Details zu allen Features finden Sie in der separaten Dokumentation:

**➡️ [FEATURE_DETAILS.md](FEATURE_DETAILS.md)** - Vollständige Dokumentation aller Features mit technischen Spezifikationen und Implementierungsdetails

Zusätzliche Dokumentationen:

- **[FEATURES.md](FEATURES.md)** - Potenzielle zukünftige Features und Entwicklungsrichtlinien
- **[CODE_QUALITY_IMPROVEMENTS.md](CODE_QUALITY_IMPROVEMENTS.md)** - Code-Qualitätsverbesserungen
- **[TESTING.md](TESTING.md)** - Test-Dokumentation und -Strategie

---

## Entwicklung

### State Management

Das Projekt verwendet ein zentralisiertes State Management mit React Context API:

#### SimulationContext

- **Zentrale Zustandsverwaltung**: Alle Simulationsparameter, Steuereinstellungen, und Berechnungsergebnisse werden im `SimulationContext` verwaltet
- **Custom Hook `useSimulation()`**: Zugriff auf den globalen State ohne Prop Drilling
- **52+ Komponenten**: Über 52 Komponenten nutzen bereits den Context direkt
- **Reduziertes Prop Drilling**: HomePage-Hierarchie wurde optimiert - von 20+ Props auf 1-2 Props pro Ebene reduziert

#### Spezialisierte Hooks

- **`useHomePageLogic`**: Aggregiert Logik und Handler für die HomePage
- **`useAnalysisConfig`**: Stellt Konfigurationen für Sensitivitätsanalyse bereit
- **`useReturnConfiguration`**: Verwaltet Rendite-Konfigurationen
- **Weitere Custom Hooks**: Über 80 spezialisierte Hooks für verschiedene Features (Entnahme, Gesundheitsversicherung, Renten, etc.)

#### Vorteile

- **Wartbarkeit**: Geringere Kopplung zwischen Komponenten
- **Wiederverwendbarkeit**: Logik in Custom Hooks gekapselt
- **Testbarkeit**: Hooks und Komponenten können isoliert getestet werden
- **Performance**: Optimiert für schnelles Laden und effiziente Updates
  - **Lazy Loading**: Große Komponenten werden erst bei Bedarf geladen (DataExport, SimulationModeSelector, ProfileManagement, etc.)
  - **Code-Splitting**: Automatische Aufteilung in separate Chunks (React-Vendor, UI-Komponenten, Charts, Forms)
  - **Bundle-Optimierung**: Hauptbundle von 1,4 MB auf 220 KB reduziert (84% Reduktion)
  - **React.memo**: Häufig re-rendernde Komponenten werden nur bei Prop-Änderungen neu gerendert
  - **useMemo/useCallback**: Teure Berechnungen werden gecached und nur bei Bedarf neu ausgeführt
  - **Suspense Fallbacks**: Nutzerfreundliche Ladezustände während des Komponentenladens

### Code-Qualitätsstandards

Das Projekt verwendet umfassende Code-Qualitätsprüfungen, die mit Codacy-Standards kompatibel sind:

#### ESLint-Regeln

- **Code-Komplexität**: Warnungen bei zyklomatischer Komplexität über 15 (Phase 4.2 - Ziel: 8 für neuen Code)
- **Verschachtelungstiefe**: Maximale Verschachtelungstiefe von 5 Ebenen
- **Funktionsgröße**: Warnungen bei Funktionen über 200 Zeilen (Phase 4.2 - Ziel: 50 für neuen Code)
- **Sicherheit**: Strenge Regeln gegen `eval`, `new Function`, etc.
- **Best Practices**: Durchsetzung von `prefer-const`, `eqeqeq`, etc.
- **Kontinuierliche Verbesserung**: Siehe `REFACTORING.md` für den schrittweisen Refactoring-Plan

#### CI/CD Pipeline

Die GitHub Actions Workflows prüfen bei jedem Push und Pull Request:

1. **Build** - Vite Build-Prozess
2. **Lint** - ESLint mit erweiterten Codacy-kompatiblen Regeln (inkl. automatisches Markdown-Linting)
3. **Type Check** - TypeScript-Typenprüfung
4. **Test** - Vitest mit Coverage (1358+ Tests)

#### Verfügbare Scripts

```bash
npm install       # Abhängigkeiten installieren
npm run dev       # Entwicklungsserver starten
npm run build     # Produktions-Build erstellen
npm run lint      # ESLint + Markdown-Linting ausführen (0 Warnungen erlaubt)
npm run typecheck # TypeScript-Typen prüfen
npm run test      # Tests ausführen
npm run test:coverage # Tests mit Coverage
```

**Hinweis:** `npm run lint` führt automatisch auch Markdown-Linting durch (`postlint` Hook).

#### Code-Qualitätsziele

- **0 Fehler**: Keine ESLint-Fehler erlaubt
- **Warnungen**: Aktuell 54 Warnungen während Phase 4.2 (Progressive Verschärfung - Ziel: 0)
- **Test-Coverage**: Umfassende Test-Abdeckung mit 1523+ Tests
- **TypeScript-Strict**: Strikte TypeScript-Konfiguration aktiviert
- **Code-Refactoring**: Aktives Refactoring zur Verbesserung der Codequalität (siehe `REFACTORING.md`)

---

**Autor:** Marco
