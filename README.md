
# Zinseszins-Rechner

Ziel des Projektes is es ein Rechner zu entwickeln, indem man viele Einstellungen vornehmen kann und vieles berücksichtigt wird.

Stand der Entwicklung unter https://zinszins-simulation.vercel.app/

---
## Implementierte Features

### Zeitspanne und Berechnungsmodus
- Flexibler Zeitraum (Standard: 2023-2040)
- Monatliche und jährliche Berechnungsmodi

### Rendite-Konfigurationen
- **Feste Rendite** - Konstante jährliche Rendite
- **Zufällige Rendite** - Monte Carlo Simulation mit konfigurierbarer durchschnittlicher Rendite und Volatilität
- **Variable Rendite pro Jahr** - Jahr-für-Jahr konfigurierbare Renditen für realistische Szenarien

### Sparplan und Einmalzahlungen
- **Sparplan** - Regelmäßige jährliche oder monatliche Einzahlungen
- **Einmalzahlungen** - Dedizierte UI für einmalige Zahlungen mit Datum und Betrag

### Kostenfaktoren
- **TER (Total Expense Ratio)** - Jährliche Verwaltungskosten in % pro Jahr
  - Wird automatisch jedes Jahr vom Portfolio abgezogen
  - Individuell konfigurierbar für jeden Sparplan und jede Einmalzahlung
- **Transaktionskosten** - Einmalige Kosten beim Kauf
  - Prozentuale Kosten (z.B. 0,25% des Kaufbetrags)
  - Absolute Kosten (z.B. 1,50€ pro Transaktion)
  - Werden nur im ersten Jahr beim Kauf abgezogen
- **Optionale Konfiguration** - Kostenfaktoren sind optional und bewahren die Abwärtskompatibilität

### Steuerberechnung
- **Vorabpauschale** - Deutsche Steuerberechnung für Investmentfonds mit vollständiger Transparenz
  - **Schritt-für-Schritt Erklärung** - Info-Icons in der Detailansicht öffnen eine umfassende Berechnung
  - **5-Stufen Berechnungsprozess**: Basiszins → Basisertrag → Jahresgewinn → Vorabpauschale → Steuerberechnung
  - **Detaillierte Aufschlüsselung** aller Zwischenschritte mit konkreten Werten
  - **Verständliche Erklärung** der deutschen Steuerregelung für thesaurierende Fonds
- **Konfigurierbare Steuerparameter**:
  - Kapitalertragsteuer (standardmäßig 26,375%)
  - Teilfreistellungsquote für Aktienfonds (standardmäßig 30%)
  - Freibetrag pro Jahr - Individuelle Konfiguration der jährlichen Steuerfreibeträge

### Auszahlungsphase
- **4% Regel** - Jährliche Entnahme von 4% des Startkapitals
- **3% Regel** - Jährliche Entnahme von 3% des Startkapitals
- **Variable Entnahme-Strategien** - Benutzerdefinierte Entnahmeprozentsätze
- **Dynamische Entnahmestrategie** - Renditebasierte Anpassung der Entnahme basierend auf Vorjahres-Performance
  - Konfigurierbare Basis-Entnahmerate
  - Obere und untere Rendite-Schwellenwerte
  - Relative Anpassungen bei Über-/Unterschreitung der Schwellen
  - Automatische Jahr-für-Jahr Anpassung basierend auf tatsächlichen Renditen
- **Monatliche Entnahme-Strategien** - Feste monatliche Entnahmen mit Inflationsanpassung und Portfolio-Guardrails
- **Variable Renditen während Entnahme** - Jahr-für-Jahr konfigurierbare Renditen für die Entnahmephase
- **Geteilte Entnahme-Phasen** - Segmentierung der Entsparphase in verschiedene Zeiträume mit unterschiedlichen Strategien
  - Frühe Rente (z.B. 2041-2055): Höhere Entnahmerate mit konservativeren Renditen
  - Mittlere Rente (z.B. 2055-2070): Ausgewogene Strategie mit moderaten Entnahmen
  - Späte Rente (z.B. 2070-2080): Niedrigere Entnahmerate für Kapitalerhalt
- **Berücksichtigung des Grundfreibetrages** - Einkommensteuer-Grundfreibetrag für Rentner ohne weiteres Einkommen
- Jahr-für-Jahr Entnahmeprojektion mit detaillierter Aufschlüsselung
- Interaktive Parametereinstellung (Rendite, Lebensende, Strategie)

### Analyse und Simulation
- **Finanzübersicht - Schnelle Eckpunkte** - Kompakte Übersicht aller wichtigen Kennzahlen für Anspar- und Entsparphase
  - Gesamte Einzahlungen, Endkapital und Zinsen der Ansparphase
  - Berechnete Rendite der Ansparphase (annualisiert)
  - Endkapital und monatliche Auszahlungen der Entsparphase
  - Berechnete Rendite der Entsparphase unter Berücksichtigung von Entnahmen
- **Monte Carlo Analyse** - Statistische Auswertung verschiedener Rendite-Szenarien
- **Detaillierte Simulation** - Jahr-für-Jahr Aufschlüsselung mit Vorabpauschale-Berechnungen
- **Parameter Export** - Ein-Klick Export aller Konfigurationsparameter in die Zwischenablage
  - Exportiert alle relevanten Parameter im deutschen Format (Parameter: xyz €, Parameter: xyz %)
  - Hilfreich für Entwicklung, Fehlerbeschreibung und Dokumentation von Simulationsszenarien
  - Inklusive Sparpläne, Steuereinstellungen, Rendite-Konfiguration und Entnahme-Parameter
- Echtzeit-Updates bei Parameteränderungen

---
## Geplante Erweiterungen

Aktuell sind alle geplanten Hauptfeatures implementiert. Zukünftige Erweiterungen könnten beinhalten:
- Weitere Steueroptimierungsstrategien
- Zusätzliche Entnahme-Modelle
- Erweiterte Reporting-Funktionen
