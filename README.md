
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

### Steuerberechnung
- **Vorabpauschale** - Deutsche Steuerberechnung für Investmentfonds
- **Konfigurierbare Steuerparameter**:
  - Kapitalertragsteuer (standardmäßig 26,375%)
  - Teilfreistellungsquote für Aktienfonds (standardmäßig 30%)
  - Freibetrag pro Jahr - Individuelle Konfiguration der jährlichen Steuerfreibeträge

### Auszahlungsphase
- **4% Regel** - Jährliche Entnahme von 4% des Startkapitals
- **3% Regel** - Jährliche Entnahme von 3% des Startkapitals
- **Variable Entnahme-Strategien** - Benutzerdefinierte Entnahmeprozentsätze
- **Monatliche Entnahme-Strategien** - Feste monatliche Entnahmen mit Inflationsanpassung und Portfolio-Guardrails
- **Variable Renditen während Entnahme** - Jahr-für-Jahr konfigurierbare Renditen für die Entnahmephase
- **Berücksichtigung des Grundfreibetrages** - Einkommensteuer-Grundfreibetrag für Rentner ohne weiteres Einkommen
- Jahr-für-Jahr Entnahmeprojektion mit detaillierter Aufschlüsselung
- Interaktive Parametereinstellung (Rendite, Lebensende, Strategie)

### Analyse und Simulation
- **Monte Carlo Analyse** - Statistische Auswertung verschiedener Rendite-Szenarien
- **Detaillierte Simulation** - Jahr-für-Jahr Aufschlüsselung mit Vorabpauschale-Berechnungen
- Echtzeit-Updates bei Parameteränderungen

---
## Geplante Erweiterungen

Aktuell sind alle geplanten Hauptfeatures implementiert. Zukünftige Erweiterungen könnten beinhalten:
- Weitere Steueroptimierungsstrategien
- Zusätzliche Entnahme-Modelle
- Erweiterte Reporting-Funktionen
