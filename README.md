
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

### Sparplan, Einmalzahlungen und Sonderereignisse
- **Sparpläne** - Regelmäßige monatliche oder jährliche Einzahlungen
- **Einmalzahlungen** - Einmalige Zahlungen mit Datum und Betrag
- **Sonderereignisse** - Besondere finanzielle Ereignisse im Lebensverlauf
  - **💰 Erbschaften** - Berücksichtigung deutscher Erbschaftsteuer nach Verwandtschaftsgrad
    - Steuerklassen und Freibeträge (Ehegatte €500k, Kind €400k, Enkelkind €200k, etc.)
    - Echtzeit-Berechnung der Erbschaftsteuer nach ErbStG
    - Automatische Netto/Brutto-Umrechnung
  - **💸 Ausgaben** - Größere Ausgaben mit optionaler Kreditfinanzierung
    - Kategorien: Autokauf, Immobilie, Bildung, Medizin, Sonstiges
    - Kreditberechnung mit Standard-Zinssätzen je Kategorie
    - Monatliche Ratenzahlung und Gesamtkosten-Aufstellung

### Kostenfaktoren
- **TER (Total Expense Ratio)** - Jährliche Verwaltungskosten in Prozent
- **Transaktionskosten** - Einmalige Kosten beim Kauf (prozentual oder absolut)
- **Kostenaufschlüsselung** - Detaillierte Darstellung aller Kostenfaktoren in der Simulation

### Steuerberechnung
- **Vorabpauschale** - Deutsche Steuerberechnung für Investmentfonds mit detaillierter Erklärung
- **Interaktive Berechnungsmodals** - Schritt-für-Schritt Aufschlüsselung der Steuerberechnungen
- **Konfigurierbare Parameter**: Kapitalertragsteuer, Teilfreistellungsquote, Freibetrag pro Jahr
- **Planungsmodus-abhängiger Sparerpauschbetrag** - Automatische Anpassung des Freibetrags basierend auf Individual- oder Paarplanung
  - **Einzelperson**: 2.000€ jährlicher Sparerpauschbetrag
  - **Ehepaar/Partner**: 4.000€ jährlicher Sparerpauschbetrag (2.000€ pro Person)
  - **Automatische Aktualisierung**: Freibeträge werden automatisch angepasst beim Wechsel des Planungsmodus
- **Einkommensteuer auf Renten** - Berücksichtigung der deutschen Rentenbesteuerung
- **Basiszins-Konfiguration** - Verwaltung der offiziellen Basiszinssätze der Deutschen Bundesbank
- **Bundesbank API Integration** - Automatischer Abruf aktueller Basiszinssätze über SDMX API
- **Validierung und Fallbacks** - Intelligente Validierung mit automatischen Fallback-Mechanismen

### Globale Planung (Einzelperson/Ehepaar)
- **Planungsmodus** - Zentrale Auswahl zwischen Individual- und Paarplanung
- **Geschlechtskonfiguration** - Geschlechtsspezifische Einstellungen für präzise Lebenserwartungsberechnung
- **Lebensende-Berechnung** - Flexible Konfiguration mit manueller oder automatischer Berechnung
  - **Manuelle Eingabe** - Direkte Jahreseingabe für das Lebensende
  - **Automatische Berechnung** - Automatische Berechnung basierend auf Geburtsjahr und Lebenserwartung (ohne manuelle Buttons)
  - **Geburtsjahr-Rechner** - Automatische Echtzeit-Berechnung der Lebenserwartung für Einzelpersonen und Paare
  - **Gemeinsame Lebenserwartung** - Automatische Joint Life Expectancy Berechnung für Paare nach aktuariellen Methoden
- **Deutsche Sterbetafeln** - Statistische Grundlagen vom Statistischen Bundesamt (2020-2022)
  - Automatische geschlechtsspezifische Auswahl
  - Unterstützung für Individual- und Paarplanung
  - Benutzerdefinierte Lebenserwartung möglich

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
- **Kranken- und Pflegeversicherung** - Umfassende Berücksichtigung von Kranken- und Pflegeversicherungsbeiträgen
  - **Einzelplanung**: Individuelle Krankenversicherung mit konfigurierbaren Beitragssätzen und Beitragsbemessungsgrenzen
  - **Paarplanung**: Optimierung für Paare mit automatischer Familienversicherung
    - **Familienversicherung**: Automatische Prüfung der Familienversicherung (505€/Monat, 538€ bei Mini-Jobs für 2025)
    - **Strategieoptimierung**: Automatische Wahl zwischen Einzelversicherung, Familienversicherung oder Optimierung
    - **Einkommensaufteilung**: Konfigurierbare Aufteilung von Entnahmebetrag und anderen Einkünften zwischen den Partnern
    - **Kostenvergleich**: Echtzeit-Vergleich verschiedener Versicherungsstrategien mit Einsparungsberechnung
  - **Versicherungsarten**: Gesetzliche und private Krankenversicherung mit unterschiedlichen Beitragssystemen
  - **Lebensphasen**: Unterscheidung zwischen Vorrente und Rente mit angepassten Beitragssätzen
  - **Zusatzbeiträge**: Kinderloser-Zuschlag (0,6%) individuell konfigurierbar pro Person
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
- **Daten Export** - CSV Export, Markdown Export, Parameter Export für alle Simulationsdaten (inkl. Sonderereignisse)
- **Konfigurationsverwaltung** - Automatisches Speichern/Laden mit localStorage Integration
- Echtzeit-Updates bei Parameteränderungen

---

**Autor:** Marco
