
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
- **Multi-Asset Portfolio** - Diversifiziertes Portfolio mit automatischem Rebalancing
  - **7 Anlageklassen** - Deutsche/Europäische Aktien, Internationale Aktien, Staatsanleihen, Unternehmensanleihen, REITs, Rohstoffe, Liquidität
  - **Individuelle Konfiguration** - Separate Einstellung von erwarteter Rendite, Volatilität und Zielallokation für jede Anlageklasse
  - **Portfolio-Übersicht** - Real-time Berechnung der erwarteten Portfolio-Rendite und des Portfolio-Risikos
  - **Automatisches Rebalancing** - Konfigurierbare Rebalancing-Häufigkeit (jährlich, quartalsweise, monatlich) mit Schwellenwert-basiertem Rebalancing
  - **Korrelationsmatrix** - Berücksichtigung historischer Korrelationen zwischen Anlageklassen für realistische Simulationen
  - **Deutsche Steuerregeln** - Vollständige Integration der Teilfreistellung für Aktien und REITs
  - **Portfolio-Validierung** - Automatische Validierung der Allokationen mit deutschen Fehlermeldungen
  - **Normalisierungsfunktion** - Ein-Klick Normalisierung der Allokationen auf 100%
- **Inflation** - Berücksichtigung während der Ansparphase mit automatischer Anpassung
  - **Inflationsbereinigte Werte** - Zusätzliche Anzeige der realen Kaufkraft (inflationsbereinigt) neben Nominalwerten
  - **Sparphase**: Alle Kapitalwerte werden sowohl nominal als auch real angezeigt (z.B. "793.512,75 € / 589.591,66 € real")
  - **Entnahmephase**: Entnahmebeträge und Kapitalwerte zeigen sowohl nominale als auch reale Kaufkraft

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
- **Günstigerprüfung** - Automatische Wahl zwischen Abgeltungssteuer und persönlichem Steuersatz
  - **Automatische Optimierung**: System vergleicht Abgeltungssteuer (26,375%) vs. individueller Einkommensteuersatz
  - **Sowohl Spar- als auch Entnahmephase**: Optimierung in beiden Phasen für maximale Steuerersparnis
  - **Transparente Darstellung**: Anzeige beider Berechnungen und Erklärung der gewählten Variante
  - **Konfigurierbare Aktivierung**: Ein-/Ausschaltbar je nach individueller Steuersituation
- **Kirchensteuer** - Berücksichtigung der deutschen Kirchensteuer
  - **Bundesländerspezifisch**: 8% für Bayern/Baden-Württemberg, 9% für andere Bundesländer
  - **Automatische Integration**: Wird bei Günstigerprüfung und Einkommensteuerberechnung berücksichtigt
  - **Konfigurierbar**: Ein-/Ausschaltbar mit präziser Prozentsatz-Einstellung (8-9%)
  - **Transparente Berechnung**: Kirchensteuer wird als Prozentsatz der Einkommensteuer berechnet
- **Planungsmodus-abhängiger Sparerpauschbetrag** - Automatische Anpassung des Freibetrags basierend auf Individual- oder Paarplanung
  - **Einzelperson**: 2.000€ jährlicher Sparerpauschbetrag
  - **Ehepaar/Partner**: 4.000€ jährlicher Sparerpauschbetrag (2.000€ pro Person)
  - **Automatische Aktualisierung**: Freibeträge werden automatisch angepasst beim Wechsel des Planungsmodus
- **Freistellungsaufträge-Optimierung** - Optimale Verteilung der Freistellungsaufträge über mehrere Bankkonten
  - **Multi-Bank-Verwaltung**: Verwaltung mehrerer Depot-/Bankkonten mit separaten Freistellungsaufträgen
  - **Automatische Optimierung**: Intelligente Verteilung des Sparerpauschbetrags auf Konten mit höchsten erwarteten Erträgen
  - **Echtzeit-Berechnungen**: Sofortige Berechnung der effektiven Steuersätze und eingesparten Steuern pro Konto
  - **Validierung**: Automatische Prüfung der Freistellungsaufträge (maximale Summe darf Sparerpauschbetrag nicht überschreiten)
  - **Empfehlungen**: Konkrete Vorschläge zur Optimierung der Freibetragsverteilung
  - **Ein-Klick-Anwendung**: Optimale Verteilung kann mit einem Klick übernommen werden
- **Einkommensteuer auf Renten** - Berücksichtigung der deutschen Rentenbesteuerung
- **Basiszins-Konfiguration** - Verwaltung der offiziellen Basiszinssätze der Deutschen Bundesbank
- **Bundesbank API Integration** - Automatischer Abruf aktueller Basiszinssätze über SDMX API
- **Validierung und Fallbacks** - Intelligente Validierung mit automatischen Fallback-Mechanismen

### Was-wäre-wenn Szenarien

- **Vordefinierte Finanzszenarien** - Lernszenarien zum Erkunden verschiedener Anlagestrategien
  - **10+ Szenarien** - Konservative, ausgewogene, wachstumsorientierte und spezielle Situationen
  - **Kategorisiert** - Szenarien nach Risikoprofil und Lebenssituation organisiert
  - **Vollständig konfiguriert** - Jedes Szenario enthält realistische Parameter (Sparrate, Rendite, Laufzeit, Steuern)
  - **Bildungsinhalte** - Lernpunkte, Risiken und Zielgruppen für jedes Szenario
  - **Ein-Klick Anwendung** - Szenarien können direkt auf die aktuelle Simulation angewendet werden
  - **Durchsuchbar** - Schnelles Finden relevanter Szenarien durch Suchfunktion
  - **Detaillierte Beschreibungen** - Umfassende Informationen zu jedem Szenario in einem übersichtlichen Modal

### Glossar-Integration

- **Interaktive Begriffserklärungen** - Kontextbezogene Tooltips für komplexe Finanzfachbegriffe
  - **15+ Fachbegriffe** - Umfassende Erklärungen deutscher Steuerbegriffe (Vorabpauschale, Günstigerprüfung, Teilfreistellung, etc.)
  - **Detaillierte Definitionen** - Kurz- und Langdefinitionen mit praktischen Beispielen
  - **Verknüpfte Begriffe** - Verwandte Begriffe werden automatisch verlinkt
  - **Überall verfügbar** - Tooltips in Konfigurationen und Simulationsausgaben
  - **Barrierearm** - Tastatur-navigierbar und screenreader-freundlich
  - **Moderne UI** - Integration mit shadcn/ui Design System

### Finanzziele & Fortschrittsverfolgung

- **SMART-Goals Integration** - Setzen und verfolgen Sie messbare Finanzziele
  - **Drei Zieltypen** - Altersvorsorge, Finanzielle Unabhängigkeit, Benutzerdefinierte Ziele
  - **Automatische Fortschrittsberechnung** - Echtzeit-Berechnung des Fortschritts basierend auf aktuellem Kapital
  - **Meilenstein-Tracking** - Automatische Meilensteine bei 25%, 50% und 75% des Ziels
  - **Visuelle Fortschrittsanzeige** - Intuitive Fortschrittsbalken und Prozentanzeigen
  - **Ziel-Status** - Aktivieren/Deaktivieren einzelner Ziele nach Bedarf
  - **Persistente Speicherung** - Ziele werden automatisch mit dem Profil gespeichert
  - **Nächster Meilenstein** - Hervorhebung des nächsten zu erreichenden Meilensteins

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
- **🏥 Pflegekosten-Simulation** - Umfassende Planung für deutsche Pflegebedürftigkeit
  - **Deutsche Pflegegrade** - Alle 5 Pflegegrade (1-5) mit korrekten Pflegegeld-Leistungen nach aktueller Gesetzgebung
  - **Kosten-Nutzen-Rechnung** - Automatische Berechnung von Brutto-Pflegekosten, gesetzlichen Leistungen und Netto-Eigenanteil
  - **Inflationsanpassung** - Konfigurierbare Inflationsrate für realistische Langzeit-Pflegekostenplanung (0-10% p.a.)
  - **Private Pflegeversicherung** - Integration privater Pflegezusatzversicherungen mit monatlichen Leistungen
  - **Steuerliche Absetzbarkeit** - Berücksichtigung außergewöhnlicher Belastungen nach deutschem Steuerrecht
  - **Paar-Planung** - Separate Konfiguration für beide Partner mit individuellen Pflegegraden und Zeiträumen
  - **Echtzeit-Kostenvorschau** - Sofortige Berechnung der erwarteten Pflegekosten mit detaillierter Aufschlüsselung
  - **Flexible Pflegedauer** - Konfigurierbare Pflegedauer oder automatische Berechnung bis Lebensende

### Interaktive Visualisierung

- **📈 Interaktive Charts** - Moderne interaktive Diagramme für bessere Datenvisualisierung
  - **Area Charts** - Gestapelte Flächendiagramme zeigen Kapitalentwicklung über Zeit
  - **Interaktive Kontrollen** - Toggle für inflationsbereinigte Werte, Steuer-Anzeige, Detail-/Übersichts-Modus
  - **Enhanced Tooltips** - Detaillierte Informationen mit Gesamtrendite-Berechnung beim Hover
  - **Zoom & Brush** - Zeitraum-Auswahl im Detail-Modus für große Datensätze
  - **Responsive Design** - Optimiert für Desktop und mobile Geräte
  - **Real-Time Updates** - Charts aktualisieren sich automatisch bei Parameteränderungen
  - **Professional Styling** - Integration mit shadcn/ui Design System

### Auszahlungsphase

- **Standard-Strategien**: 4% Regel, 3% Regel, variable Entnahme-Strategien
- **Dynamische Entnahmestrategie** - Renditebasierte Anpassung der Entnahme
- **Drei-Eimer-Strategie** - Cash-Polster für negative Rendite-Phasen
- **RMD-ähnliche Entnahme** - Geschlechtsspezifische Entnahme basierend auf Lebenserwartung
- **Kapitalerhalt / Ewige Rente** - Strategie zum dauerhaften Erhalt des realen Kapitalwerts
- **Steueroptimierte Entnahme** - Automatische Optimierung zur Minimierung der Steuerlast
  - **Drei Optimierungsmodi**: Steuerminimierung, Netto-Maximierung oder ausgewogener Ansatz
  - **Freibetrag-Optimierung**: Intelligente Nutzung des Sparerpauschbetrags (85% Zielnutzung)
  - **Deutsche Steuerregeln**: Integration von Vorabpauschale, Teilfreistellung und Basiszins
  - **Dynamische Anpassung**: Jährliche Neukalibrierung basierend auf Portfolioentwicklung
  - **Kapitalerhalt-Fokus**: Optimiert für langfristige Vermögenserhaltung mit Steuereffizienz
- **Monatliche Entnahme-Strategien** - Feste monatliche Entnahmen mit Inflationsanpassung und Anzeige realer Kaufkraft
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
- **Andere Einkünfte** - Zusätzliche Einkommensquellen während der Entnahmephase
  - **Kindergeld-Integration** - Automatische Berücksichtigung deutschen Kindergelds
    - **Altersbasierte Berechnung**: Kindergeld endet automatisch mit dem 18. Geburtstag (oder 25 bei Ausbildung)
    - **Steuerfrei**: Kindergeld ist steuerfrei und wird nicht auf das Einkommen angerechnet
    - **Aktuelle Beträge**: 250€/Monat pro Kind (Stand 2024)
    - **Mehrere Kinder**: Separate Konfiguration für jedes Kind mit individuellem Geburtsjahr
    - **Ausbildungsberücksichtigung**: Option zur Verlängerung bis zum 25. Geburtstag bei Ausbildung/Studium
  - **Immobilien-Cashflow Integration** - Umfassende Immobilienertragsberechnung mit deutschen Steuerregeln
    - **Realistische Kostenfaktoren**: Instandhaltungskosten (0-30%), Leerstandsquote (0-20%), Finanzierungskosten
    - **Wertsteigerungsberechnung**: Optionale Berücksichtigung der Immobilienwertsteigerung als zusätzliches Einkommen
    - **Deutsche Immobiliensteuer**: Vollständige Integration der steuerlichen Behandlung von Mieteinnahmen
    - **Inflationsanpassung**: Automatische Mietanpassungen über die Entnahmephase
  - **Weitere Einkommensarten**: Private Renten, Gewerbeeinkünfte, Kapitalerträge, sonstige Einkünfte
  - **Brutto-/Netto-Konfiguration**: Flexible Eingabe mit automatischer Steuerberechnung
  - **Zeitraum-Flexibilität**: Konfigurierbare Start- und Endjahre für zeitlich begrenzte Einkünfte

### Analyse und Simulation

- **Finanzübersicht** - Kompakte Übersicht aller wichtigen Kennzahlen mit Sticky Navigation
- **Strategievergleich** - Umfassende Vergleichsmöglichkeiten für Entnahmestrategien
- **Historisches Backtesting** - Test mit 24 Jahren Marktdaten (DAX, S&P 500, MSCI World)
- **Monte Carlo Analyse** - Statistische Auswertung verschiedener Rendite-Szenarien
- **Sensitivitätsanalyse** - Analyse der Auswirkungen von Parameteränderungen
  - **Parameter-Ranking** - Automatische Bewertung der einflussreichsten Faktoren
  - **Interaktive Visualisierung** - Grafische Darstellung der Auswirkungen einzelner Parameter
  - **Szenario-Vergleich** - Vergleich von niedrigsten, höchsten und Basis-Szenarien
  - **Handlungsempfehlungen** - Praktische Tipps zur Optimierung der Finanzplanung
  - **5 Parameter-Analysen** - Rendite, Sparrate, Steuerlast, Inflationsrate, Anlagedauer
- **Black Swan Ereignisse** - Simulation extremer Markteinbrüche für Portfolio-Stresstests
  - **Historische Krisen** - Dotcom-Blase (2000-2003), Finanzkrise (2008-2009), COVID-19 Pandemie (2020)
  - **Detaillierte Ereignisprofile** - Jahr-für-Jahr Renditen basierend auf historischen Daten
  - **Kumulativer Verlust** - Automatische Berechnung des Gesamtverlusts über die Krisendauer
  - **Flexible Zeitplanung** - Wählbares Jahr für Krisensimulation innerhalb des Anlagezeitraums
  - **Erholungszeit-Anzeige** - Historische Daten zur durchschnittlichen Markterholung
  - **Widerstandsfähigkeitstest** - Bewertung der Portfolio-Robustheit in Extremszenarien
- **Inflationsszenarien** - Simulation verschiedener Inflationsentwicklungen für Portfolioanalyse
  - **Hyperinflation** - Anhaltend hohe Inflation (8-12% p.a.) ähnlich der 1970er Jahre
  - **Deflation** - Negative Inflation (-2% bis 0%) ähnlich Japan in den 1990er Jahren
  - **Stagflation** - Kombination aus hoher Inflation (6-8%) und reduzierten Renditen
  - **Kaufkraftverlust-Berechnung** - Automatische Berechnung des realen Kaufkraftverlusts über die Szenariodauer
  - **Kumulative Inflation** - Gesamtinflation und durchschnittliche jährliche Inflationsrate
  - **Rendite-Anpassungen** - Bei Stagflation werden Renditen automatisch reduziert
  - **Flexible Zeitplanung** - Wählbares Startjahr für Inflationsszenario innerhalb des Anlagezeitraums
  - **Kombinierbar mit variablen Renditen** - Integration in bestehende Variable-Renditen-Konfiguration
- **Erweiterte Risikobewertung** - Value-at-Risk (5% & 1% VaR), Maximum Drawdown, Sharpe Ratio, Sortino Ratio, Calmar Ratio
- **Risiko-Zeitreihen** - Detaillierte Drawdown- und Rendite-Serien für tiefere Analyse
- **Detaillierte Simulation** - Jahr-für-Jahr Aufschlüsselung mit Vorabpauschale-Berechnungen
- **Berechnungsaufschlüsselung** - Interaktive Erklärungen für Steuer- und Zinsberechnungen
- **Daten Export** - CSV Export, Markdown Export, Parameter Export für alle Simulationsdaten (inkl. Sonderereignisse)
- **Profilverwaltung** - Umfassende Verwaltung mehrerer Konfigurationsprofile
  - **Profile erstellen** - Neue Profile für verschiedene Familien oder Testszenarien
  - **Profilwechsel** - Nahtloser Wechsel zwischen verschiedenen Konfigurationen mit einem Klick
  - **Automatisches Speichern** - Alle Änderungen werden automatisch im aktiven Profil gespeichert
  - **Profil-Aktionen** - Bearbeiten, Duplizieren und Löschen von Profilen
  - **Rückwärtskompatibilität** - Automatische Migration von Legacy-Konfigurationen
  - **Aktiver Profil-Status** - Klare Anzeige des aktuell aktiven Profils mit Zeitstempel
- Echtzeit-Updates bei Parameteränderungen

---

## Entwicklung

### Code-Qualitätsstandards

Das Projekt verwendet umfassende Code-Qualitätsprüfungen, die mit Codacy-Standards kompatibel sind:

#### ESLint-Regeln

- **Code-Komplexität**: Warnungen bei zyklomatischer Komplexität über 20 (Phase 4.1 - Ziel: 8 für neuen Code)
- **Verschachtelungstiefe**: Maximale Verschachtelungstiefe von 5 Ebenen
- **Funktionsgröße**: Warnungen bei Funktionen über 300 Zeilen (Phase 4.1 - Ziel: 50 für neuen Code)
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
- **Warnungen**: Aktuell 19 Warnungen während Phase 4.1 (Progressive Verschärfung - Ziel: 0)
- **Test-Coverage**: Umfassende Test-Abdeckung mit 1523+ Tests
- **TypeScript-Strict**: Strikte TypeScript-Konfiguration aktiviert
- **Code-Refactoring**: Aktives Refactoring zur Verbesserung der Codequalität (siehe `REFACTORING.md`)

---

**Autor:** Marco
