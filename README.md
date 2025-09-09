
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
- **Basiszins-Konfiguration (Deutsche Bundesbank)** - Verwaltung der offiziellen Basiszinssätze für Vorabpauschale-Berechnungen
  - **Automatischer Abruf** - Integration mit der Deutschen Bundesbank API (geplant)
  - **Historische Daten** - Offizielle Basiszinssätze von 2018-2024 bereits enthalten
  - **Manuelle Eingabe** - Möglichkeit zur Eingabe zukünftiger Zinssätze (z.B. für 2025+)
  - **Flexible Konfiguration** - Jahr-für-Jahr anpassbare Zinssätze mit Quellenangabe
  - **Echtzeit-Update** - Simulation wird automatisch bei Änderungen neu berechnet

### Auszahlungsphase
- **4% Regel** - Jährliche Entnahme von 4% des Startkapitals
- **3% Regel** - Jährliche Entnahme von 3% des Startkapitals
- **Variable Entnahme-Strategien** - Benutzerdefinierte Entnahmeprozentsätze
- **Dynamische Entnahmestrategie** - Renditebasierte Anpassung der Entnahme basierend auf Vorjahres-Performance
  - Konfigurierbare Basis-Entnahmerate
  - Obere und untere Rendite-Schwellenwerte
  - Relative Anpassungen bei Über-/Unterschreitung der Schwellen
  - Automatische Jahr-für-Jahr Anpassung basierend auf tatsächlichen Renditen
- **Drei-Eimer-Strategie (Bucket-Strategie)** - Vereinfachte Simulation der beliebten Bucket-Strategie
  - **Cash-Polster**: Anfängliches Cash-Polster (Standard: €20,000) für Entnahmen bei negativen Renditen
  - **Intelligente Entnahme-Logik**: Automatische Auswahl zwischen Portfolio (positive Rendite) und Cash-Polster (negative Rendite)
  - **Auffüll-Mechanismus**: Überschussgewinne werden automatisch ins Cash-Polster verschoben
    - Auffüll-Schwellenwert: Gewinne müssen konfigurierbaren Betrag überschreiten (Standard: €5,000)
    - Auffüll-Anteil: Prozentsatz der Überschussgewinne für Cash-Polster (Standard: 50%)
  - **Konfigurierbare Basis-Entnahmerate**: Unabhängige Entnahmerate für Portfolio-Berechnungen (Standard: 4%)
  - **Marktschutz**: Vermeidung von Verkäufen zu ungünstigen Kursen während Marktabschwüngen
- **RMD-ähnliche Entnahme (Lebenserwartung)** - Entnahmestrategie basierend auf statistischer Lebenserwartung
  - **Altersbasierte Berechnung**: Jährliche Entnahme = Portfoliowert ÷ Lebenserwartungs-Divisor
  - **Deutsche Sterbetafeln**: Verwendung offizieller Daten vom Statistischen Bundesamt (2020-2022)
  - **Ansteigende Entnahmen**: Entnahmerate steigt automatisch mit dem Alter (65 Jahre: ~5,2%, 80 Jahre: ~11,8%)
  - **Vollständiger Kapitalverzehr**: Zielt auf Aufbrauch des Portfolios bis zum statistischen Lebensende
  - **Flexible Konfiguration**: Wählbares Startalter und optionale benutzerdefinierte Lebenserwartung
  - **Realistische Projektionen**: Basiert auf deutschen Mortalitätsdaten für authentische Planungsszenarien
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
- **Erweiterte Risikobewertung** - Umfassende Risikoanalyse für Ansparen und Entnehmen
  - **Value-at-Risk (VaR)** - Potenzielle Verluste bei 95% und 99% Konfidenzintervall
  - **Maximum Drawdown** - Größter historischer Verlust vom Höchststand zum Tiefststand
  - **Sharpe Ratio** - Risikoadjustierte Rendite pro Risikoeinheit
  - **Sortino Ratio** - Downside-Risk-adjustierte Rendite (nur negative Volatilität)
  - **Calmar Ratio** - Rendite pro Drawdown-Risiko
  - **Volatilität** - Standardabweichung der Renditen als Prozentsatz
  - **Drawdown-Analyse** - Jahr-für-Jahr Aufschlüsselung historischer Portfolio-Rückgänge
  - **Zusammengeklapptes "Risikobewertung" Panel** - Organisiert in beiden Tabs (Ansparen/Entnehmen)
    - Einzelwerte prominent angezeigt in farbcodierten Karten
    - Monte Carlo Analyse als Unterpanel
    - Detaillierte Drawdown-Tabelle als Unterpanel
    - Deutsche Erklärungen aller Risikokennzahlen
- **Detaillierte Simulation** - Jahr-für-Jahr Aufschlüsselung mit Vorabpauschale-Berechnungen
- **Parameter Export** - Ein-Klick Export aller Konfigurationsparameter in die Zwischenablage
  - Exportiert alle relevanten Parameter im deutschen Format (Parameter: xyz €, Parameter: xyz %)
  - Hilfreich für Entwicklung, Fehlerbeschreibung und Dokumentation von Simulationsszenarien
  - Inklusive Sparpläne, Steuereinstellungen, Rendite-Konfiguration und Entnahme-Parameter
- **Daten Export** - Umfassende Export-Funktionen für alle Simulationsdaten
  - **CSV Export**: Jahr-für-Jahr Aufschlüsselung der Sparphase und Entnahmephase in Excel/Calc-kompatiblem Format
  - **Markdown Export**: Vollständiger Bericht mit Parametern, Berechnungsformeln und Übersichtstabellen
  - **Berechnungs-Export**: Detaillierte Formeln und Erklärungen der verwendeten Berechnungsmethoden
  - Deutsche Zahlenformatierung und GitHub/Wiki-kompatible Ausgabe
- Echtzeit-Updates bei Parameteränderungen

---
## Geplante Erweiterungen

Aktuell sind alle geplanten Hauptfeatures implementiert. Zukünftige Erweiterungen könnten beinhalten:
- Weitere Steueroptimierungsstrategien
- Zusätzliche Entnahme-Modelle
- Erweiterte Reporting-Funktionen
