
# Zinseszins-Rechner

Deutscher Zinseszins-Rechner für Sparpläne und Kapitalanlagen mit umfassender Steuerberechnung und Entnahmeplanung.

**Live-Version:** https://zinszins-simulation.vercel.app/

---
## Implementierte Features

### Zeitspanne und Berechnungsmodus
- Flexibler Zeitraum-Selektor
- Monatliche und jährliche Berechnungen

### Rendite-Konfigurationen
- **Feste Rendite** - Konstante jährliche Rendite
- **Zufällige Rendite** - Monte Carlo Simulation mit Volatilität
- **Variable Rendite** - Jahr-für-Jahr konfigurierbare Renditen
- **Historische Daten** - Backtesting mit DAX, S&P 500, MSCI World (2000-2023)
- **Inflation** - Berücksichtigung während der Ansparphase mit automatischer Anpassung

### Sparplan und Einmalzahlungen
- **Sparpläne** - Regelmäßige monatliche oder jährliche Einzahlungen
- **Einmalzahlungen** - Einmalige Zahlungen mit Datum und Betrag

### Kostenfaktoren
- **TER (Total Expense Ratio)** - Jährliche Verwaltungskosten in Prozent
- **Transaktionskosten** - Einmalige Kosten beim Kauf (prozentual oder absolut)
- **Kostenaufschlüsselung** - Detaillierte Darstellung aller Kostenfaktoren in der Simulation

### Steuerberechnung
- **Vorabpauschale** - Deutsche Steuerberechnung für Investmentfonds mit detaillierter Erklärung
- **Interaktive Berechnungsmodals** - Schritt-für-Schritt Aufschlüsselung der Steuerberechnungen
- **Konfigurierbare Parameter**: Kapitalertragsteuer, Teilfreistellungsquote, Freibetrag pro Jahr
- **Einkommensteuer auf Renten** - Berücksichtigung der deutschen Rentenbesteuerung
- **Basiszins-Konfiguration** - Verwaltung der offiziellen Basiszinssätze der Deutschen Bundesbank
- **Bundesbank API Integration** - Automatischer Abruf aktueller Basiszinssätze über SDMX API
- **Validierung und Fallbacks** - Intelligente Validierung mit automatischen Fallback-Mechanismen

### Globale Konfiguration
- **Lebensende-Parameter** - Zentrale Konfiguration für alle Entnahmestrategien
- **Planungsmodus** - Individual- oder Paarplanung mit geschlechtsspezifischen Daten
- **Geburtsjahr-Rechner** - Automatische Berechnung der Lebenserwartung
- **Deutsche Sterbetafeln** - Statistische Grundlagen vom Statistischen Bundesamt

### Auszahlungsphase
- **Standard-Strategien**: 4% Regel, 3% Regel, variable Entnahme-Strategien
- **Dynamische Entnahmestrategie** - Renditebasierte Anpassung der Entnahme
- **Drei-Eimer-Strategie** - Cash-Polster für negative Rendite-Phasen
- **RMD-ähnliche Entnahme** - Geschlechtsspezifische Entnahme basierend auf Lebenserwartung
- **Kapitalerhalt / Ewige Rente** - Strategie zum dauerhaften Erhalt des realen Kapitalwerts
- **Monatliche Entnahme-Strategien** - Feste monatliche Entnahmen mit Inflationsanpassung
- **Variable Renditen** - Jahr-für-Jahr konfigurierbare Renditen für die Entnahmephase
- **Geteilte Entnahme-Phasen** - Segmentierung in verschiedene Zeiträume mit unterschiedlichen Strategien
- **Strategienvergleich** - Vergleich verschiedener Entnahmestrategien mit demselben Startkapital
- **Gesetzliche Rente Integration** - Vollständige Integration der deutschen gesetzlichen Rente
- **Andere Einkünfte** - Zusätzliche Einkommensquellen wie Mieteinnahmen, private Renten oder Gewerbeeinkünfte mit Brutto-/Netto-Konfiguration, Inflationsanpassung und Steuerberechnung

### Analyse und Simulation
- **Finanzübersicht** - Kompakte Übersicht aller wichtigen Kennzahlen mit Sticky Navigation
- **Strategievergleich** - Umfassende Vergleichsmöglichkeiten für Entnahmestrategien
- **Historisches Backtesting** - Test mit 24 Jahren Marktdaten (DAX, S&P 500, MSCI World)
- **Monte Carlo Analyse** - Statistische Auswertung verschiedener Rendite-Szenarien
- **Erweiterte Risikobewertung** - Value-at-Risk (5% & 1% VaR), Maximum Drawdown, Sharpe Ratio, Sortino Ratio, Calmar Ratio
- **Risiko-Zeitreihen** - Detaillierte Drawdown- und Rendite-Serien für tiefere Analyse
- **Detaillierte Simulation** - Jahr-für-Jahr Aufschlüsselung mit Vorabpauschale-Berechnungen
- **Berechnungsaufschlüsselung** - Interaktive Erklärungen für Steuer- und Zinsberechnungen
- **Daten Export** - CSV Export, Markdown Export, Parameter Export für alle Simulationsdaten
- **Konfigurationsverwaltung** - Automatisches Speichern/Laden mit localStorage Integration
- Echtzeit-Updates bei Parameteränderungen

---

**Autor:** Marco
